#!/usr/bin/env node
/* build.mjs — stamp the shared chrome into every page, and generate /guides/.
 *
 * Why this exists: the chrome (stylesheet links, header, nav, mobile menu,
 * script tags) was hand-copied into every HTML file. At thirteen pages that was
 * survivable; at the hundred guides this site is heading for, every nav tweak,
 * cache-token bump and footer fix becomes a hundred-file edit that can land on
 * ninety-seven and miss three. It already did: 404.html shipped with no header
 * at all, found in the 2026-09-01 review.
 *
 * The deploy model does not change. This writes plain HTML back into the repo
 * and that committed HTML is what GitHub Pages serves. There is no dist/, no
 * Action, no framework. Run it, commit the result. The pre-commit hook in
 * .githooks/pre-commit runs it for you.
 *
 *   node build.mjs           stamp everything, write files
 *   node build.mjs --check   exit 1 if any file would change (used by the hook)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CHECK = process.argv.includes('--check');

const data = JSON.parse(readFileSync(join(ROOT, '_data/guides.json'), 'utf8'));
const TOKEN = data.cacheToken;
const GUIDES = [...data.guides].sort((a, b) => b.n - a.n);   // newest first, always
const nnn = (n) => String(n).padStart(3, '0');

const partial = (f) => readFileSync(join(ROOT, '_partials', f), 'utf8').trimEnd();

/* The mobile panel lists the newest few, then sends people to the archive.
   It must not become the whole index: past ~20 guides that is an unusable
   scroll on a phone, and "All guides" is already the first row. */
const LATEST_IN_MENU = 6;
const latestLinks = GUIDES.slice(0, LATEST_IN_MENU)
  .map((g) => `    <a href="/${g.slug}.html"><span>Nº${nnn(g.n)} · ${g.system}</span></a>`)
  .join('\n');

const BLOCKS = {
  'head-assets': partial('head-assets.html'),
  header: partial('header.html').replace('{{LATEST}}', latestLinks),
  scripts: partial('scripts.html'),
};

const stamp = (s) => s.replaceAll('{{TOKEN}}', TOKEN);

/* ── one-time migration ───────────────────────────────────────────────
   The pages predate this script and carry no markers.

   This removes the chrome ELEMENT BY ELEMENT rather than slicing a range
   between two landmarks. The first version of this function did slice a range,
   and it ate page-specific `og:` meta tags and the per-page `<style>` blocks on
   git.html and alternatives.html, because the order of things inside <head>
   differs from page to page — privacy.html puts its og tags before the icon
   link, every other page puts them after. That drift is exactly what this
   script exists to end, so the migration cannot assume it away.

   After the first run every page is marker-driven and none of this fires. */

// walk balanced <div> … </div> from an opening tag, return the index just past it
function endOfDiv(html, start) {
  const re = /<\/?div\b/gi;
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) return html.indexOf('>', m.index) + 1;
  }
  return -1;
}

function cutBlock(html, openRe, closeTag) {
  const m = html.match(openRe);
  if (!m) return html;
  const start = m.index;
  const end = closeTag === '</div>'
    ? endOfDiv(html, start)
    : html.indexOf(closeTag, start) + closeTag.length;
  return end > start ? html.slice(0, start) + html.slice(end) : html;
}

function migrate(html, guide) {
  if (!html.includes('<!-- build:head-assets -->')) {
    html = html.replace(/^[ \t]*<link rel="icon"[^>]*>\n?/m, '');
    html = html.replace(/^[ \t]*<link rel="stylesheet" href="[^"]*assets\/css\/[^"]*"[^>]*>\n?/gm, '');
    html = cutBlock(html, /<noscript><style>/, '</noscript>');
    const rp = html.indexOf('/* Reading plate');
    if (rp !== -1) {
      const open = html.lastIndexOf('<script>', rp);
      const close = html.indexOf('</script>', rp) + '</script>'.length;
      html = html.slice(0, open) + html.slice(close);
    }
    html = html.replace(/\s*<\/head>/, '\n<!-- build:head-assets -->\n<!-- /build:head-assets -->\n</head>');
  }

  if (!html.includes('<!-- build:header -->')) {
    html = html.replace(/^[ \t]*<a class="skip-link"[^>]*>.*?<\/a>\n?/ms, '');
    html = cutBlock(html, /<header\b/, '</header>');
    html = html.replace(/^[ \t]*<div class="mobilenav__backdrop"><\/div>\n?/m, '');
    html = cutBlock(html, /<div id="mobile-navigation"/, '</div>');
    html = html.replace(/(\s*)<main\b/, '\n<!-- build:header -->\n<!-- /build:header -->\n<main');
  }

  if (guide && !html.includes('<!-- build:guidenav -->')) {
    html = html.replace(/(\s*)<div class="article__footer"/,
      '\n<!-- build:guidenav -->\n<!-- /build:guidenav -->\n      <div class="article__footer"');
  }

  if (!html.includes('<!-- build:scripts -->')) {
    // by src, so any page-specific script near the bottom is left alone
    html = html.replace(
      /^[ \t]*<script src="[^"]*(?:gsap\.min|ScrollTrigger\.min|splitting\.min|site)\.js[^"]*"[^>]*><\/script>\n?/gm, '');
    html = html.replace(/\s*<\/body>/, '\n<!-- build:scripts -->\n<!-- /build:scripts -->\n</body>');
  }
  return html;
}

function fill(html, currentHref, guide) {
  const blocks = { ...BLOCKS };
  if (guide) blocks.guidenav = guideNav(guide);
  for (const [name, body] of Object.entries(blocks)) {
    const re = new RegExp(`<!-- build:${name} -->[\\s\\S]*?<!-- /build:${name} -->`);
    if (re.test(html)) {
      html = html.replace(re, `<!-- build:${name} -->\n${body}\n<!-- /build:${name} -->`);
    }
  }
  /* You-are-here. The header is generated, so the build is the only place that
     knows which page it is writing. */
  if (currentHref) {
    html = html.replaceAll(`<a href="${currentHref}" class="hover_effect">`,
                           `<a href="${currentHref}" class="hover_effect" aria-current="page">`);
    html = html.replaceAll(`<a href="${currentHref}"><span>All guides</span></a>`,
                           `<a href="${currentHref}" aria-current="page"><span>All guides</span></a>`);
  }

  /* The skip link lives in the header partial and points at #main, so its
     target is this script's business. alternatives.html shipped without
     `id="main"` — one page of thirteen, so the skip link on it had always been
     a dead anchor. Exactly the drift the partials exist to end, so it is closed
     here rather than by hand. */
  html = html.replace(/<main\b(?![^>]*\bid=)([^>]*)>/, '<main$1 id="main">');

  // one token, everywhere, from one constant
  html = html.replace(/\?v=[0-9a-zA-Z._-]+/g, `?v=${TOKEN}`);
  return stamp(html);
}

/* ── where to go next ─────────────────────────────────────────────────
   Every guide page linked zero other guides and had no prev/next, so each one
   was a dead end. For traffic arriving one guide at a time from a reel that was
   the largest retention loss on the site — larger than the nav problem that
   started this work. Found 2026-09-01.

   Derived, not hand-maintained. Prev/next come from `n`; related comes from
   shared `tags`, most overlap first, and a guide may override with its own
   `related: ["slug", …]` in the manifest. At ten guides hand-picking would be
   fine; at the hundred this site is heading for it would be three hundred
   editorial decisions, so the default is computed.

   Uses `.button__big`, the link-row component the sources block already uses —
   no new design language. */
function guideNav(g) {
  const byN = new Map(GUIDES.map((x) => [x.n, x]));
  const prev = byN.get(g.n - 1);       // older
  const next = byN.get(g.n + 1);       // newer
  const label = (x) => `Nº${nnn(x.n)} · ${x.system}`;

  const row = (x, kicker) =>
    `        <a href="/${x.slug}.html" class="button button__big hover_effect">` +
    `<span><em class="guideNav__kicker">${kicker}</em> ${label(x)}</span> ` +
    `<span class="arrow">&#8599;</span></a>`;

  const seq = [];
  if (next) seq.push(row(next, 'Next'));
  if (prev) seq.push(row(prev, 'Previous'));

  const tags = new Set(g.tags || []);
  const chosen = (g.related || []).map((s) => GUIDES.find((x) => x.slug === s)).filter(Boolean);
  const computed = GUIDES
    .filter((x) => x.slug !== g.slug && x.n !== g.n - 1 && x.n !== g.n + 1)
    .map((x) => ({ x, score: (x.tags || []).filter((t) => tags.has(t)).length }))
    .filter((o) => o.score > 0)
    .sort((a, b) => b.score - a.score || b.x.n - a.x.n)
    .map((o) => o.x);
  const related = [...chosen, ...computed]
    .filter((x, i, a) => a.findIndex((y) => y.slug === x.slug) === i)
    .slice(0, 3);

  const relatedRows = related.map((x) =>
    `        <a href="/${x.slug}.html" class="button button__big hover_effect">` +
    `<span>${label(x)} &mdash; ${x.headline}</span> <span class="arrow">&#8599;</span></a>`);

  return `      <div class="guideNav">
        <h4 aria-level="2" class="guideNav__head">Keep going</h4>
        <div class="buttons">
${seq.join('\n')}
        </div>
${related.length ? `        <p class="monospace monospace__p guideNav__label">Related</p>
        <div class="buttons">
${relatedRows.join('\n')}
        </div>\n` : ''}        <p class="monospace monospace__p guideNav__all"><a href="/guides/">All ${GUIDES.length} guides &#8599;</a></p>
      </div>`;
}

/* ── the archive ──────────────────────────────────────────────────────
   A ruled index, not a stack of headlines. Founder's call 2026-09-01 after
   looking at four built options side by side: the first version set the
   headline at 30px in the display face and the ordinal at 12px mono at 55%
   opacity, so ten rows read as ten headlines rather than a list, and only six
   fitted on a screen.

   Four aligned columns — ordinal, title, system, runtime — with a rule after
   the ordinal and the runtime flush right, so there are two hard alignment
   edges and you can scan one column without reading any of the others. The
   headline drops to list scale. A mono header row declares it is a table
   before the first row is read.

   No FILED stamp per row: it is a good motif on ten rows and wallpaper on a
   hundred. No thumbnails: three of ten guides have no film, and 100 stills is
   an image budget for no scanning gain.

   Rows past VISIBLE_ROWS are in the HTML but hidden by CSS, so every guide
   stays crawlable and reachable without JavaScript while the first screen
   stays short. `blurb` renders only when a guide has one. */
const VISIBLE_ROWS = 30;

function archive() {
  const rows = GUIDES.map((g, i) => {
    const blurb = g.blurb ? `<span class="cardRow__blurb">${g.blurb}</span>` : '';
    return `      <a class="cardRow${i >= VISIBLE_ROWS ? ' is-overflow' : ''}" href="/${g.slug}.html">` +
      `<span class="cardRow__n monospace">Nº${nnn(g.n)}</span>` +
      `<span class="cardRow__t">${g.headline}${blurb}</span>` +
      `<span class="cardRow__s monospace">${g.system}</span>` +
      `<span class="cardRow__r monospace">${g.runtime || '&mdash;'}</span></a>`;
  }).join('\n');

  const search = GUIDES.map((g) =>
    `${g.n} ${nnn(g.n)} ${g.headline} ${g.system} ${(g.tags || []).join(' ')}`.toLowerCase()
  );
  const hidden = Math.max(0, GUIDES.length - VISIBLE_ROWS);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Every field guide — Hubert</title>
<meta name="description" content="Every Hubert field guide, newest first. One large system per guide, taken apart on screen. Drawn, sourced, and free.">
<meta name="theme-color" content="#1a1a1a">
<meta property="og:type" content="website">
<meta property="og:title" content="Every field guide — Hubert">
<meta property="og:description" content="Every Hubert field guide, newest first.">
<meta property="og:image" content="/artifacts/site-card.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://huberttheinventor.github.io/guides/">
<!-- build:head-assets -->
<!-- /build:head-assets -->
</head>
<body class="journal">
<div class="topOverlay"></div>
<!-- build:header -->
<!-- /build:header -->
<main class="main" id="main">
  <div class="scanlines"></div>
  <div class="gloom"></div>
  <div class="vignette"></div>
  <section class="section section__lightgrey">
    <div class="cardDrawer">
      <div class="cardDrawer__head">
        <h1>Every guide.</h1>
        <p class="lead">One large system per guide, taken apart on screen. Newest first.</p>
        <label class="cardDrawer__filter">
          <span class="monospace">Filter</span>
          <input type="search" id="guide-filter" autocomplete="off"
                 placeholder="system, title, or number" aria-describedby="guide-count">
        </label>
        <p class="monospace monospace__p" id="guide-count" role="status" aria-live="polite">${GUIDES.length} guides</p>
      </div>
      <div class="cardDrawer__rows" id="guide-rows">
        <span class="cardRow cardRow--head monospace" aria-hidden="true"><span>Nº</span><span>Title</span><span>System</span><span>Run</span></span>
${rows}
      </div>
      <p class="monospace monospace__p cardDrawer__empty" id="guide-empty" hidden>Nothing filed under that.</p>
      <button type="button" class="monospace cardDrawer__more" id="guide-more"${hidden ? '' : ' hidden'}>
        Show the other <span id="guide-more-n">${hidden}</span> &#8595;
      </button>
    </div>
  </section>
</main>
<!-- build:scripts -->
<!-- /build:scripts -->
<script>
/* Filter and "show more" both work on rows that are already in the HTML — the
   rows are the data. No fetch, no index to keep in sync, and with JavaScript
   off you get every guide. Filtering searches the whole set, including rows the
   "show more" button is currently holding back. */
(function () {
  var HAY = ${JSON.stringify(search)};
  var input = document.getElementById('guide-filter');
  var rows = [].slice.call(document.querySelectorAll('#guide-rows .cardRow:not(.cardRow--head)'));
  var count = document.getElementById('guide-count');
  var empty = document.getElementById('guide-empty');
  var more = document.getElementById('guide-more');
  var expanded = false;
  if (!input) return;
  function apply() {
    var q = input.value.trim().toLowerCase();
    var shown = 0, matched = 0;
    rows.forEach(function (row, i) {
      var hit = !q || HAY[i].indexOf(q) !== -1;
      if (hit) matched++;
      var capped = !q && !expanded && row.classList.contains('is-overflow');
      row.hidden = !hit || capped;
      if (!row.hidden) shown++;
    });
    count.textContent = matched + (matched === 1 ? ' guide' : ' guides') +
      (q ? ' matching “' + input.value.trim() + '”' : '');
    empty.hidden = matched !== 0;
    if (more) more.hidden = expanded || !!q || matched <= shown;
  }
  input.addEventListener('input', apply);
  input.addEventListener('search', apply);
  if (more) more.addEventListener('click', function () {
    expanded = true;
    apply();
    var first = rows.filter(function (r) { return !r.hidden; })[30];
    if (first) first.focus ? first.focus() : null;
  });
  apply();
})();
</script>
</body>
</html>
`;
}

/* ── the sitemap ──────────────────────────────────────────────────────
   Generated, because a hand-kept sitemap is one more thing that silently falls
   behind: this one already listed twelve URLs and knew nothing about /guides/.
   Guide 11 now adds itself. 404.html stays out, matching robots.txt. */
function sitemap() {
  const BASE = 'https://huberttheinventor.github.io';
  const urls = [
    { loc: `${BASE}/`, priority: '1.0' },
    { loc: `${BASE}/guides/`, priority: '0.9' },
    ...GUIDES.map((g) => ({ loc: `${BASE}/${g.slug}.html`, priority: '0.8' })),
    { loc: `${BASE}/privacy.html`, priority: '0.3' },
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by build.mjs from _data/guides.json. Do not hand-edit. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

/* ── run ──────────────────────────────────────────────────────────────── */
const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const changed = [];

for (const f of pages) {
  const before = readFileSync(join(ROOT, f), 'utf8');
  const guide = GUIDES.find((g) => `${g.slug}.html` === f) || null;
  const after = fill(migrate(before, guide), null, guide);
  if (after !== before) {
    changed.push(f);
    if (!CHECK) writeFileSync(join(ROOT, f), after);
  }
}

const guidesDir = join(ROOT, 'guides');
if (!existsSync(guidesDir)) mkdirSync(guidesDir, { recursive: true });
const archivePath = join(guidesDir, 'index.html');
const archiveOut = fill(archive(), '/guides/', null);
const archiveBefore = existsSync(archivePath) ? readFileSync(archivePath, 'utf8') : '';
if (archiveOut !== archiveBefore) {
  changed.push('guides/index.html');
  if (!CHECK) writeFileSync(archivePath, archiveOut);
}

const sitemapPath = join(ROOT, 'sitemap.xml');
const sitemapOut = sitemap();
if (sitemapOut !== (existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '')) {
  changed.push('sitemap.xml');
  if (!CHECK) writeFileSync(sitemapPath, sitemapOut);
}

if (CHECK) {
  if (changed.length) {
    console.error('build: these files are out of date — run `node build.mjs`:');
    changed.forEach((f) => console.error('  ' + f));
    process.exit(1);
  }
  console.log('build: everything up to date');
} else {
  console.log(`build: token ${TOKEN}, ${GUIDES.length} guides, ${changed.length} file(s) written`);
  changed.forEach((f) => console.log('  ' + f));
}
