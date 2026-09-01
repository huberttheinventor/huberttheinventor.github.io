# huberttheinventor.github.io

Hubert's field guides. One large system per guide, taken apart on screen.

Live at <https://huberttheinventor.github.io> — GitHub Pages, served from the
`main` branch, `/` path. Legacy build, no Actions. **The committed HTML is what
ships.**

> **This repository is the source.** Edit it here.
>
> An earlier README said this repo was generated from a `site/` directory
> upstream and should not be edited directly. That has not been true for some
> time: `scripts/publish-site.mjs` no longer exists anywhere, the `site/`
> directory in the video repo is the superseded four-page design built on the
> retired `tokens.css` system, and every commit here since has been made
> directly. Corrected 2026-09-01, because following the old instruction sends
> you to a dead design — which has already cost three rejected design attempts.

## The build step

The shared chrome — stylesheet links, header, nav, mobile menu, script tags —
lives in `_partials/` and is stamped into every page by `build.mjs`. Guides are
described once in `_data/guides.json`.

```
node build.mjs           stamp the chrome, regenerate /guides/ and sitemap.xml
node build.mjs --check   exit 1 if anything is out of date (used by the hook)
```

This is not a framework and there is no `dist/`. The script writes plain HTML
back into the repo and that HTML is what Pages serves. The deploy model is
unchanged; what changed is that the chrome has one source instead of thirteen
copies.

**Why it exists.** The chrome used to be hand-copied into every page. At
thirteen pages that was survivable. At the hundred guides this site is heading
for, every nav tweak, cache-token bump and footer fix becomes a hundred-file
edit that can land on ninety-seven files and miss three — which is exactly how
`404.html` shipped with no header at all, and how `alternatives.html` shipped
without the `id="main"` its own skip link pointed at. Both found 2026-09-01.

**The hook.** `git config core.hooksPath .githooks` is already set in this
clone; `.githooks/pre-commit` runs the build and restages what it rewrote, so a
page cannot be committed out of step with the partials. On a fresh clone, run
that `git config` line once.

## Adding a guide

1. Write `<slug>.html`. Start from the newest existing guide — the chrome
   region between the `<!-- build:… -->` markers will be overwritten, so only
   the page's own `<head>` tags and its `<main>` content matter.
2. Add an entry to `_data/guides.json` (`n`, `slug`, `headline`, `system`,
   `runtime`, `video`, `tags`; `blurb` is optional and renders only if present).
3. Bump `cacheToken` in the same file if any asset changed.
4. `node build.mjs`, then commit. The archive at `/guides/`, the newest-first
   ordering, the mobile menu's latest-six list and `sitemap.xml` all update
   themselves.

Never hand-edit anything between `<!-- build:x -->` and `<!-- /build:x -->`,
`guides/index.html`, or `sitemap.xml` — the next build overwrites all of them.

## Layout

```
_data/guides.json     every guide, once. the spine.
_partials/            head-assets, header, scripts — the shared chrome
build.mjs             stamps the chrome, generates /guides/ and sitemap.xml
.githooks/pre-commit  runs the build so the two cannot drift
assets/css/99-hubert.css   the only stylesheet that is ours; everything else
                           in assets/css/ is a vendored port, see its header
guides/index.html     GENERATED — the archive
*.html                the pages; chrome regions are generated
DESIGN.md             the design system, extracted and kept current
DESIGN-REVIEW.md      the standing review, findings and what was left alone
```

## Conventions worth knowing

- **Absolute asset and chrome paths** (`/assets/…`, `/guides/`). This is a user
  Pages site at the domain root, and `/guides/` sits one level down, so relative
  paths would resolve differently by depth.
- **One cache token**, from `cacheToken` in `_data/guides.json`, applied to
  every asset URL by the build. GitHub Pages serves everything
  `Cache-Control: max-age=600` with an ETag, so the token is not the deploy
  gate — but it does gate iteration, and a stale stylesheet in your own browser
  will waste an hour if you forget.
- **`99-hubert.css` is the only stylesheet that is ours.** Its header explains
  when overriding the port is allowed and when it is a bug in the port.
