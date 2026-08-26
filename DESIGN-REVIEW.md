# DESIGN-REVIEW.md — huberttheinventor.github.io

Reviewed 2026-08-26 against the live site, then re-verified against the local
build on branch `review/design-fixes`.

Tools used, all installed from their own READMEs:

| tool | how it was installed | status |
|---|---|---|
| Playwright CLI | `npm install -g @playwright/cli@latest`, then `playwright-cli install-browser chromium` | installed, used for every measurement below |
| Taste Skill | `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend` | installed as `design-taste-frontend` |
| Web Design Guidelines | `npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines`, rules fetched from `vercel-labs/web-interface-guidelines/main/command.md` | installed |
| Awesome Design | repo cloned; the collection is DESIGN.md files, there is no installer | used as the comparison bar for `DESIGN.md` |

The `taste-skill` README's own install line points at `Leonxlnx/taste-skill`;
the Web Design Guidelines README points the skill at a different repo
(`vercel-labs/agent-skills`) from the one the guidelines live in. Both installed
cleanly. Nothing was half-installed.

**How to read the citations.** `assets/css/00-critical.css` is a 15-line minified
bundle, so a line number there locates almost nothing. Findings in that file are
cited as `file:line` plus the exact selector, which is what you can actually
search for. Hand-written pages carry real line numbers, taken from the state of
`main` at review time.

Every number below was measured this session. Where a number came from the
browser it says "computed"; where it came from a file on disk it says so.

---

## Executive summary

The site is in better shape than a first look suggests, and the two things most
likely to be blamed are not the problems.

**Checked and dismissed.** Screenshot review flagged sentences that fade out
mid-line across the guide pages, which reads as broken copy. It is not. It is
the `effect__textFade` scroll-scrubbed reveal, and it only looked stuck because
the first screenshot pass drove the page with `window.scrollTo`, which Lenis
overrides. Re-driven with real wheel events and a 2.5s settle, the count of
in-viewport text nodes still below 0.5 opacity was 0 on index, 0 on kubernetes,
0 on whatsapp, and 4, 5, 46 and 66 on netflix, gps, google-search and
design-plugins, all of them within 30px of the bottom edge of the viewport,
which is where a reveal is supposed to be mid-flight. Also dismissed: horizontal
overflow. Root `scrollWidth` equals `clientWidth` on all ten pages at both
390x844 and 1440x900. `html { overflow-x: clip }` is doing its job.

**What is actually wrong, in order.**

1. **Keyboard focus is invisible on nine of the ten pages.** `assets/css/00-critical.css:1`
   sets `a { outline: 0 }` and nothing anywhere defines a replacement. Measured:
   on each of the nine pages, seven of the first eight focusable elements report
   `outline-style: none` with no box-shadow and no border change. The eighth,
   the Menu button, keeps the browser default, which resolves to
   `outline: auto 1px rgb(16,16,16)` on a `#1a1a1a` header. `git.html` — the
   page everyone knows is off-design — is the only page with a working focus
   ring.

2. **The surface every article is read on fails WCAG AA.** `#111111` on
   `#71737d` is 4.00:1. AA wants 4.5:1 below 24px. The apparatus on that same
   plate is dimmed with `opacity: .5` and `.55`, landing at 2.12:1 and 2.29:1.
   This is the single most consequential item and the fix is a palette decision,
   so it is yours, not mine. Numbers and one-line options are in
   "Not applied" below.

3. **The nav bug shipped again, in the place it was not checked.** The desktop
   nav duplicate-Guide-03/04 bug was fixed in commit 9bd438a. The same duplicate
   is still in `kubernetes.html`'s mobile menu (`kubernetes.html:57` on `main`),
   and Guides 06 and 07 were missing from both navs on all five earlier guides,
   and Guides 02 to 07 were missing from `privacy.html`. A reader on Guide 01
   through 05 had no route to the two newest guides. And the reason that nav
   was never completed shows up the moment you complete it: the open mobile
   panel cannot hold ten links. On the **live** homepage, which already has ten,
   the list runs to y689 while the two small footer links are pinned at
   y651-675, so they are printed straight through "The List", 38px of overlap.
   That is fixed here too, because otherwise the nav repair would have spread it
   to eight more pages.

4. **The CRT never stops.** `site.js` gates every GSAP animation off
   `prefers-reduced-motion` and does it thoroughly. The scanline layers are pure
   CSS and were never gated. Verified with the media feature emulated: on all
   nine template pages `scanline` (8s) and `scanlines` (1s) were still reported
   `running` with iteration count `Infinity`, and the homepage's decorative
   video still reported `paused: false`.

5. **The 3D stack loads on every page.** `assets/js/site.js:12` statically
   imports `three.module.min.js`. `logo3d` appears in `index.html` only, but a
   cold load of `privacy.html` at 390x844 pulled 21 requests / 432 KB including
   `three.module.min.js` at 165 KB over the wire plus the floppy-disk glTF and
   its textures. On a text-only privacy page, for phone readers.

6. **The homepage announces 40 top-level headings.** Five marquees, each
   repeating its line eight times, each repetition a full `<h1>`.

Everything else is smaller. Full list follows.

Counts: 7 blockers, 11 majors, 9 minors, 7 nits. 21 fixed on this branch,
15 left for you because they are direction calls.

---

## 1. Playwright CLI pass — reality first

Ten pages driven at 390x844 and 1440x900 on the live site, 83 screenshots, plus
a DOM probe pass per page at top-of-page and after real wheel scrolling, plus a
cold-cache network pass in a fresh browser context.

### 1.1 Console and network

Clean, with one exception and one caveat.

- **Console errors: none of ours.** The only warning is
  `THREE.GLTFLoader: Unknown extension "KHR_materials_pbrSpecularGlossiness"`
  from the floppy-disk model, which is a model-authoring note, not a failure.
- **One transient 503** on `img/works/branding15.webp` during the first pass.
  The file exists in the repo (33,894 bytes on disk) and the same URL served 200
  on every later request. Recorded, not reported as a defect. It was GitHub
  Pages, not the site.
- **No 4xx or 5xx on any local asset** across all ten pages on the cold-cache
  pass.

### 1.2 Dead links and anchors

| severity | finding | fix |
|---|---|---|
| **blocker** | `netflix.html:282` links `href="#map"`, and `netflix.html:106` is `<figure class="journalArticle__banner map">` with no `id`. `kubernetes.html:110` and `gps.html:115` both carry `id="map"`. The "jump to the map" control on the flagship guide does nothing. | add `id="map"` — **applied** |
| **major** | `privacy.html:105` links `https://buttondown.com/privacy`, which returns 404. This is the named processor's privacy policy on your privacy page. `https://buttondown.com/legal/privacy` returns 200. | **applied** |

All other external links resolve: the five plugin repos, both Instagram URLs,
`twitter.com/jasonlong`, the CC BY 3.0 deed, `goatcounter.com/help/privacy`, and
`buttondown.com/huberttheinventor`. All 14 referenced local artefacts exist.

### 1.3 Cross-page inconsistency

This is the category you flagged, and it is the richest one.

| severity | finding | fix |
|---|---|---|
| **blocker** | Guides 06 and 07 missing from the desktop **and** mobile nav on `netflix`, `kubernetes`, `whatsapp`, `google-search`, `gps`. `index` and `design-plugins` have all seven. | **applied**, both navs, all five pages |
| **blocker** | `kubernetes.html:57` repeats Guide 03 and Guide 04 in the mobile menu, so that menu lists ten items with two duplicates. Same bug class as commit 9bd438a, in the nav that commit did not touch. | **applied** |
| **blocker** | The open mobile panel overlaps itself on any page with ten nav links. Measured on the **live** site at 390x844: `.mobilenav` is 717px tall with `padding-top: 20svh`, so the list starts at y169 and ten links at 52px end at y689, while `.mobilenav__social` is pinned `absolute; bottom: 5vh` at y651-675. On `index.html` that is a 38px overlap with "The List" printed through the two small links. `netflix.html`, with eight links, measured 0. Adding Guides 06 and 07 takes every guide page to ten links, so the nav fix above would have spread this to eight more pages. | **applied** — top padding to 12svh (list now y101-621, 30px clear of the block), the panel becomes a scrollable flex column, and the social block uses `margin-top: auto` instead of an absolute offset. Verified 0 overlap at 390x844, 390x667 and 430x932; the block still sits at exactly y651-675 at 390x844, the same place as on `main` |
| **major** | `privacy.html` nav carried Index, Guide 01, Sources, The List only. Six guides unreachable from it. | **applied**, both navs |
| **major** | `privacy.html` was the only template page with no `.topOverlay`. The header is `position: fixed` and transparent (computed: `rgba(0,0,0,0)`, `backdrop-filter: none`, 99px tall), so the backdrop element is the only thing keeping copy from running through the wordmark. Measured: `.topOverlay` reports `position: fixed, top: 0, opacity: 1` on the six guide pages, and was absent on `privacy`. Screenshot review found the wordmark printed through headings on all four privacy bands. | **applied** |
| **major** | `index.html`'s `.topOverlay` reports `position: sticky, opacity: 0, top: 845` at scroll 0 and `opacity: 0` still at scrollY 4000. The homepage header has no backdrop at any scroll position. | **not applied** — see below, the hero is dark enough that the fix may be unwanted |
| **minor** | Cache-busting `?v=` differed per page: `msz0kztq` (index), `msz0l00s` (netflix), `msz1k8sd` (five pages), `1a0161a4047` (privacy, 404), with `headerfix02` pinned separately on `99-hubert.css` everywhere. Same assets, four different cache keys. | unified to `?v=2026-08-26-review` — **applied**. This also guarantees the CSS and JS edits on this branch actually reach readers. |
| **minor** | Guides 01 and 02 offer the map "as a vector" (`.svg`); guides 03, 04 and 05 offer the `.png` only. `artifacts/` confirms: only `netflix-system-map.svg` and `kubernetes-system-map.svg` exist. | **not applied** — needs the SVG files exported |
| **minor** | `git.html` has no `theme-color`; every other page has one. | **applied** (`#f7f2e9`, matching its paper) |
| **nit** | Instagram is linked as `https://www.instagram.com/...` in the shared chrome and `https://instagram.com/...` in `git.html`'s footer and `privacy.html:132`. Both resolve. | not applied |
| **nit** | Guides 06 and 07 have no video, transcript, reading list or `#sources` artefacts, unlike 01 to 05, but sit in the same numbered series. | not applied, content decision |

### 1.4 Tap targets at 390x844

Measured on the live site, every element matching
`a[href], button, input, select, textarea, [role=button], [tabindex]`.

| severity | element | measured | fix |
|---|---|---|---|
| **major** | mobile menu social links ("Instagram ↗", "Privacy note ↗") | 91.3 x **12** px, on all eight pages with a mobile menu | **not applied.** They sit flush (651.2-663.2 and 663.2-675.2), so an overlay pseudo-element does not work: probing every pixel with the second link's overlay in place gave 12px and 45px of real target, which is worse. Real padding does not fit either — the panel is already 38px over its own height on a ten-link page. Fixing this properly means giving the panel a different bottom block, which is a layout decision |
| **major** | the "Menu" button, the only nav control on phones | 75.7 x **36.9** px | `min-height: 44px` on `header .menu` — **applied** |
| **major** | `git.html` email field | 177 x **21** px | 44px min-height in `tokens.css` — **applied** |
| **major** | `git.html` "Send it" button | 57.5 x **21** px | 44px min-height — **applied** |
| **major** | `git.html` consent checkbox | **13 x 13** px | 20px box, 44px row — **applied** |
| **minor** | footer link rows across all pages | 350 x 25.9 px | clears WCAG 2.2 AA (24px) but not the 44px guideline; padding change is a rhythm decision — not applied |
| **minor** | "the map as an image" / "as a vector" inline links | 156.2 x 16 and 90.4 x 16 px | inline links in prose; not applied |

`git.html` already had `min-height: 44px` documented for exactly these controls
in `assets/css/99-hubert.css:71` — but that file belongs to the other stylesheet
bundle and `git.html` does not load it. The rules were written and never reached
the page. They are now in `tokens.css`.

### 1.5 Weight, measured cold in a fresh context

| page | requests | content-length total | notable |
|---|---|---|---|
| `index.html` | 31 | 790 KB | `three.module.min.js` 165 KB, `hubert-hero.mp4` 95 KB, floppy normal map 68 KB, `cloud10.png` 57 KB |
| `privacy.html` | 21 | 432 KB | `three.module.min.js` 165 KB **and the glTF model**, on a page with no canvas |
| `netflix.html` | 23 | see below | `guide-01.mp4` |
| `git.html` | 11 | 198 KB | 163 KB of it from `fonts.gstatic.com` |

**major — the 3D stack loads everywhere.** `assets/js/site.js:12-15` statically
imports Three, GLTFLoader, RoomEnvironment and BufferGeometryUtils at module
top level. `logo3d` appears in `index.html` only (verified: `grep -c logo3d`
returns 1 for index, 0 for the other nine). Both `privacy.html` and
`netflix.html` fetched Three and the floppy model on a cold load. **Not applied**
— the four functions that use Three (`webgl`, `renderer`, `cloudField`,
`gogglesMark`, `pricingObject`) hold 48 `THREE.` references between them, and
moving them behind `await import()` is a real refactor of `site.js`, not a
design fix. Concrete fix: move those five functions into `assets/js/webgl.js`
and have `webgl()` do `const m = await import('./webgl.js')` only when
`el('.logo3d__canvas') || el('.pricing__box canvas')` is truthy.

**major — guide videos buffer before anyone presses play.** `guide-01.mp4` is
4,193,214 bytes on disk. On a cold load at 390x844 with no interaction,
Chromium issued `Range: bytes=0-`, the server answered `206` with
`content-range: bytes 0-4193213/4193214`, and the element reported
`buffered: 43.3s` of a `173s` video before going idle. `preload="metadata"` was
set and was treated as a hint. Guide videos on disk run 4.19 to 5.73 MB.
**Applied**: `preload="none"` on all five guide videos. The poster still
renders, so nothing visible changes.

**minor — `git.html` loads fonts from `fonts.gstatic.com`** (163 KB of the
page's 198 KB) while every other page self-hosts from `assets/fonts/`. It is
also a third-party request that `privacy.html` does not mention. Not applied;
self-hosting Archivo, Newsreader and JetBrains Mono is a decision about
`git.html`'s future.

---

## 2. Web Design Guidelines audit

Rules fetched fresh from
`vercel-labs/web-interface-guidelines/main/command.md` this session.

### Blockers

`assets/css/00-critical.css:1` — `a{color:inherit;cursor:pointer;font-weight:inherit;outline:0;text-decoration:none}`
removes the focus outline from every anchor with no replacement. There is no
`:focus-visible` rule anywhere in the bundle (`focusVisible: 0` measured on all
nine pages; `git.html` reports 1). Violates "Never `outline: none` without focus
replacement" and "Interactive elements need visible focus".
**Applied** — `:focus-visible` ring added to `assets/css/99-hubert.css`,
resolving off `var(--color, var(--primarycolor))` so it works on all four
plates: `#bababa` on the dark plates is 8.97:1 against `#1a1a1a`, `#111111` on
the light-grey plate is 4.00:1 against `#71737d`. Both clear the 3:1 a non-text
indicator needs.

`index.html:33` — 40 `<h1>` elements. Five marquees x eight repetitions.
Violates "Headings hierarchical `h1`–`h6`".
**Applied** — `aria-hidden="true"` on the 39 duplicates, one kept. A tag swap
was rejected: `assets/css/00-critical.css:1` styles the bare `h1` selector
(`h1{font-size:6vw;line-height:.9}`) and `.marqueeText__title` does not set a
size, so changing the tag would change the type.

All nine template pages — heading sequence runs `h1` then `h4` with nothing
between (measured: `144444` on the guides, `1444444` on privacy).
**Applied** — `aria-level="2"` on the article `h4`s, 41 across seven pages. A
tag swap was rejected here too: `h4{font-size:6vw}` / `h4{font-size:10vw}` and
`article h4{border-top:var(--border);font-size:250%}` are all bare-tag rules, so
`<h4>` to `<h2>` would resize every section head.

All nine template pages — no skip link (`git.html` has one:
"Skip to the ladder"). Violates "include skip link for main content".
**Applied** — `.skip-link` to `#main`, off-screen until focused, plus
`id="main"` on `<main>`.

All nine template pages — no `<nav>` and no `<footer>` element. The nav is
`<div class="nav layout__second">`, the footer is
`<section class="section no__p footer section__blue">`.
**Applied** — `role="navigation"` with `aria-label` on both navs and
`role="contentinfo"` on the footer section. Roles rather than element swaps
because the CSS keys off `.nav` and off the `section` element in places.

`prefers-reduced-motion` is not honoured by the CSS layer. Verified with the
media feature emulated on `/`, `/netflix.html`, `/design-plugins.html`:
`scanline` (8s, `iterations: Infinity`) and `scanlines` (1s,
`iterations: Infinity`) both `running`; the homepage mini video `paused: false`.
`git.html` reported zero animations, correctly.
**Applied** — a `@media (prefers-reduced-motion: reduce)` block in
`99-hubert.css` stopping `.scanlines::before`, `.scanlines::after`,
`.wrapper::after` and `section .branding__imageStack::after`, plus a
`reduced` branch in `heroMedia()` in `site.js` that pauses the mini video. The
layers stay on screen at their normal opacity; only the movement stops.

### Majors

`assets/css/00-critical.css:1` — `.scanlines:after{animation:scanlines 1s steps(60) infinite; ...}`
animates `background-position`, not `transform`/`opacity`. Violates
"Animate `transform`/`opacity` only". Not applied; rewriting the scanline to a
transform is a rendering change to the site's signature texture and belongs
with you.

`assets/css/00-critical.css:1` — `.wrapper:after{animation:foreground .5s steps(1) infinite; ... position:fixed; mix-blend-mode:overlay; z-index:100}`
is an 11-step jump loop on a fixed full-viewport blended layer. The Taste Skill
calls out this exact pattern (6.E). It is correctly on a fixed
`pointer-events: none` pseudo-element, which is the right construction; it is
the uncapped repaint that is the cost. Gated under reduced motion now; left
running otherwise.

`index.html` — `<video autoplay loop muted playsinline>` with no `controls`,
no `poster`, and no pause affordance. Violates "Autoplay motion >5 seconds
alongside other content needs pause, stop, or hide controls". The reduced-motion
half is applied; adding a visible pause control changes the composition, so it
is not.

No `color-scheme` declared anywhere (`getComputedStyle(html).colorScheme`
returned `normal` on all ten pages). On a `#1a1a1a` page that leaves native
scrollbars and form controls in the light default. Violates
"`color-scheme: dark` on `<html>` for dark themes".
**Applied** — `html { color-scheme: dark }` in `99-hubert.css`. `git.html` is
a light page and does not load that file, so it is unaffected.

`git.html:302` — the email field's computed `font-size` is 13.33px. iOS Safari
zooms the viewport when a field below 16px takes focus. Violates the input/zoom
rule. **Applied** — 16px in `tokens.css`.

Anchor targets sit under the fixed 99px header. Violates
"`scroll-margin-top` on heading anchors". **Applied** —
`scroll-margin-top: 116px` on identified block elements in `99-hubert.css`.

### Minors

- `assets/css/00-critical.css:1` — `.section .pricing__box--badge` sets
  `font-family: var(--mono)`. `--mono` is not defined anywhere, so the badge
  inherits the display face instead of the mono one. **Applied**: set to `Mono`.
- `index.html` — five `img/home/benefit*.webp` stills had no `loading="lazy"`
  despite sitting well below the fold on a 10,276px-tall mobile page.
  **Applied**.
- `index.html` — 65 `<img>` elements, none with `width`/`height`. Violates
  "`<img>` needs explicit `width` and `height`". **Not applied**: they sit in
  tracks whose height is set in CSS (`.homeworks__showcaseItem img { height: 100% }`),
  so the CLS exposure is small, and writing 60 sets of intrinsic dimensions by
  hand is a change I would rather you sanction than guess at.
- `index.html` — the same five stills all carry `alt="Still from Guide 01"`.
  Accurate but not distinguishing. Not applied, copy decision.
- `git.html` — the form posts to Buttondown's embed endpoint with
  `target="popupwindow"` and an `onsubmit` that calls `window.open`. Popup
  blockers are the normal case on mobile. Not applied; the form's existence is
  a direction call (see below).
- `404.html` has no meta description. It carries `robots: noindex`, so this is
  correct as-is. Recorded so it is not re-flagged.

### Nits

- `assets/css/00-critical.css:1` — `.arrow{font-family:obviously, ...}`. No
  `obviously` face is shipped or `@font-face`d, so every `↗` on the site falls
  back to the system UI sans rather than to a face in the system.
- `GeistMono` is `@font-face`d in `00-critical.css` and referenced by no rule.
  Two font files in the repo that nothing can request.
- Two custom cursor elements on the homepage (`.homeVideoOverlay__closeCursor`
  "Click to close", `.homeworks__skimCursor` "Hold to skim"). The Taste Skill
  bans custom cursors outright (9.A). They are pointer-only affordances with no
  keyboard equivalent.
- Copy: `privacy.html:131-132` renders as "@huberttheinventoron Instagram" at
  390px. The source is correct (a newline separates the anchor from "on
  Instagram"), so the space is being lost by Splitting.js when it tokenises
  around the child anchor. Putting the anchor and the following words on one
  source line with an explicit space would fix it.

---

## 3. Taste Skill pass

Judged as `design-taste-frontend` would: what is distinctive, what is
execution, what is a default the site reached for. The CRT / mono / numbered
field-guide character is the brief, not a finding.

### What is genuinely good, and should not be touched

- **The sealed font roles.** SemiSqueezed for display, Graphik for prose, Mono
  for every piece of apparatus, no exceptions. This is a real system decision
  and it is what makes the site recognisable at thumbnail size.
- **Plates instead of cards.** Four full-bleed colour plates and hairline rules,
  zero shadows, zero elevation. Most sites in the Awesome Design collection
  reach for a card at the first sign of grouping. This one does not.
- **The link row.** One CTA component, full column width, rule above and below,
  mono label left, `↗` right, fill wiping up on hover. It is on every page
  including `404.html`. One component, one intent, no duplicate-CTA problem.
- **The sealed diagram palette.** The system maps carry their colours inline
  from the poster file so the page cannot drift from the artefact people
  download. That is a discipline most design systems do not bother with.
- **The comments in `99-hubert.css` and `tokens.css`.** Every deviation is
  explained with the measurement that caused it and the date. This is above the
  bar of anything in the reference collection.

### Where the execution slips

**major — the type scale is not a scale.** Headings are declared in `vw`
(`20vw`, `15vw`, `10vw`, `6vw`, `5vw`, `4vw`, `3vw`, `2.8vw`), mid sizes in
percentages (`260%`, `250%`, `150%`, `130%`, `100%`, `90%`, `80%`, `70%`, `55%`,
`50%`), and floors in px inside two breakpoints. Rendered on the guide pages,
that produces 78 / 39 / 30 / 20 / 14 / 13 / 12 / 11 / 10 px at 390 and
172.8 / 86.4 / 63.6 / 40.3 / 17.1 / 12.2 px at 1440. There is no step you can
name. Compare `tokens.css`, which has a documented four-rung canyon with a
deliberate missing rung. The off-design page has the better scale.

**major — the 10px tier.** At 390px, guide pages set eyebrows, stamp fields and
status labels at 10px, and the homepage renders 1,030 text nodes at 10px. On a
phone, for developers arriving from a reel, that is below the floor `tokens.css`
sets for itself (`--t-label: clamp(12px, ..., 13.5px)`, with a comment that says
"Floors respect a 12px min"). The site's own better system disagrees with it.

**major — the diagram is the product and it is unreadable on the primary
viewport.** Screenshot review, independently by two passes, could not resolve a
single internal label on the system maps at 390px: the maps render inside a
~316px card and the internal type lands at roughly 5-6px, while the legend
underneath is at normal mono size and fully readable. So the phone reader gets a
legible legend explaining a picture they cannot read. The escape hatch exists
(the map is downloadable as PNG, and as SVG on guides 01 and 02) but the link
sits further down the page, not under the figure. **Not applied** — the fix is
compositional: make the figure itself a link to the full-size artefact, or add
a pinch-to-zoom viewer, or crop the map into the three or four annotated details
the article already walks through.

**minor — no radius scale.** `var(--radius)` (`.5vw`, overridden to `1vh`) in
five rules, plus hard-coded `8px`, `12px`, `0` and `999px`. The Taste Skill's
Shape Consistency Lock (4.4) asks for one scale or a documented rule. Neither
exists.

**minor — the decorative status dot.** `<span class="rec">●</span>` sits at the
end of the nav on every template page, and every marquee line is prefixed with a
`●`. Section 9.F bans decorative status dots by default and allows them only for
real semantic state. Here they are ornament. They are also, arguably, the
site's signature. Your call; recorded because the skill flags it and you should
decide rather than inherit it.

**Deliberately not counted as findings.** The Taste Skill also bans, as AI
tells: section-number eyebrows (`Nº001 / What is collected`), em-dashes
anywhere, mono uppercase eyebrows above every section, and `Brand · No. 01`
sub-eyebrows. This site is a numbered series of field guides; the numbering is
the brand, not a tell, and the em-dash rule is that skill's house style, not a
defect. Flagging them would be exactly the flooding you asked me to avoid.

---

## 4. Awesome Design pass

The site's de-facto system is extracted into **`DESIGN.md`** at the repo root,
in the collection's format: YAML front matter with `colors`, `typography`,
`rounded`, `spacing` and `breakpoints`, then Overview / Colors / Typography /
Layout / Shapes / Components / Motion / Do's and Don'ts / Responsive Behavior.

### Against the collection's bar

Measured against the 74 entries in `VoltAgent/awesome-design-md`, using
`linear.app` as the closest comparison (near-black canvas, single accent, dense
technical register):

| dimension | collection bar | this site |
|---|---|---|
| named colour tokens | semantic (`surface-1`, `ink-muted`, `hairline`) | literal (`--lightgrey`, `--blue`, `--black`) — `--black` is the name of a **plate background** and also the name of the **ink on another plate** |
| type scale | named steps with explicit size, weight, line-height, tracking | three unit systems, no nameable step |
| spacing | a scale | `vw` values with px overrides, no tokens |
| radius | a scale | one token plus three hard-coded values |
| focus | defined | undefined on 9 of 10 pages |
| dark/light | one committed theme | **two whole systems in one repo** |
| do's and don'ts | documented | documented only inside `tokens.css`, which nine pages do not load |

The system passes the collection's bar on colour discipline, component
restraint, and font-role sealing. It fails on tokenisation and on having a
single source of truth.

### Self-contradictions

All eleven are listed under "Contradictions in the system as shipped" in
`DESIGN.md`. The load-bearing ones:

1. **The two-design-systems problem.** `git.html` loads `tokens.css` and no part
   of the System A bundle. Warm paper `oklch(96.2% 0.012 85)` against `#1a1a1a`;
   Archivo + Newsreader + JetBrains Mono against SemiSqueezed + Graphik + Mono;
   a 4pt spacing scale and a `clamp()` canyon against `vw`; its own header, its
   own footer, no site nav at all. You know about this one, so it is reported
   here once and not repeated in the other sections. What is worth adding: the
   off-design page is the **better-engineered** of the two. It is the only page
   with a focus ring, the only page with a skip link, the only page with a
   documented spacing scale, the only page with a 12px type floor, and the only
   page that respects reduced motion completely. If the paper system is being
   retired, its engineering should be ported first.
2. **`--black` is used as both a background and an ink.** `.section__black`
   sets `--background: var(--black)`; `.section__lightgrey` sets
   `--color: var(--black)`. The name carries no role.
3. **The reading plate fails its own ink** (item 2 in the summary).
4. **Focus has no design** in System A and a proper token (`--focus`) in
   System B.
5. **The footer is a `<section>` and the nav is a `<div>`** in System A; both
   are real elements in System B.

---

## Applied on `review/design-fixes`

21 fixes. Nothing here changes a colour, a size, a typeface, a layout or a
piece of copy.

**`assets/css/99-hubert.css`** (reaches nine pages)
1. `:focus-visible` ring on every interactive element, resolving off the plate's
   own text colour.
2. `.skip-link`, off-screen until focused.
3. 44px hit area on `header .menu` via an overlay pseudo-element, box and
   position unchanged.
3b. The open mobile panel is a scrollable flex column with `padding-top: 12svh`
   and the social block on `margin-top: auto`, so ten nav links stop colliding
   with it. See §1.3.
4. `touch-action: manipulation` on interactive elements.
5. `html { color-scheme: dark }`.
6. `scroll-margin-top: 116px` on identified block elements.
7. `.section .pricing__box .button` label from `var(--background)` (2.43:1 on
   its own fill) to `var(--bgcolor)` (8.97:1).
8. `.section .pricing__box--badge` gets a real mono family instead of the
   undefined `var(--mono)`.
9. `@media (prefers-reduced-motion: reduce)` stopping the four uncapped CRT
   animations.

**HTML, all pages**
10. `role="navigation"` + `aria-label` on both navs, `role="contentinfo"` on the
    footer section, `id="main"` on `<main>`, skip link before `<header>`.
11. `?v=` unified to `2026-08-26-review` so the CSS and JS edits above actually
    invalidate.

**Nav repair**
12. Guides 06 and 07 added to desktop and mobile nav on the five earlier guides.
13. Duplicate Guide 03 / Guide 04 removed from `kubernetes.html`'s mobile menu.
14. `privacy.html` nav carries the full guide list, desktop and mobile.

**Per page**
15. `netflix.html` — `id="map"` on the map figure.
16. `privacy.html` — `.topOverlay` added; `buttondown.com/privacy` →
    `buttondown.com/legal/privacy`.
17. `index.html` — `aria-hidden="true"` on 39 duplicate marquee `<h1>`;
    `loading="lazy"` + `decoding="async"` on five below-fold stills.
18. Five guide pages — `aria-level="2"` on 41 article `h4`s;
    `preload="metadata"` → `preload="none"` on the guide videos.
19. `git.html` — the `data-goatcounter="https://CODE.goatcounter.com/count"`
    tag removed (the placeholder was never replaced, so it could never count
    anything, and it loaded third-party JS your privacy note says is not there);
    `theme-color` added. **`tokens.css`** — the subscribe form's sizing, ported
    from the rules already written for it in `99-hubert.css` that this page
    cannot load: 16px field, 44px minimums, 20px checkbox.
20. **`tokens.css`** — `.plate--midnight` rebinds `--focus`. The token is set
    for paper, where its comment says it clears 3:1; the subscribe form sits on
    the midnight plate, where the ring measured about 2.4:1 against the field.
    It now resolves to the plate's own `--sun`, the way every other colour on
    that plate rebinds.

**`assets/js/site.js`**
21. `heroMedia()` pauses the decorative mini video and drops its `autoplay`
    attribute under reduced motion.

---

## Not applied — these are yours

Ranked by what I would decide first.

**1. The reading plate. `--lightgrey: #71737d`.**
`#111111` on it is 4.00:1; AA needs 4.5:1 below 24px. This is the background of
every article body on every guide, plus `privacy.html` and `404.html`. Three
ways out, all one line, all measured:

- Lighten the plate to `#7b7d87` → 4.61:1 with the existing ink. A 4% luminance
  lift; the plate stays the same hue and the same blue-grey. **This is what I
  would do.** One caveat, which is why I did not: it makes the
  `.section .pricing__box .button` label worse, from 2.43:1 to 2.11:1 — already
  fixed independently in item 7 above, so that objection is now moot.
- Keep the plate, take the ink to `#000000` → 4.45:1. Still short.
- Keep the plate, take the ink to `#ffffff` → 4.72:1. Passes, and inverts the
  section's whole read.

Whichever you pick, the apparatus needs the same pass: `.opacity__50` and the
`.55` opacities on that plate land at 2.12:1 and 2.29:1 today, and would still
fail at full opacity on the current plate (4.00:1). Dimming apparatus with
opacity is the system's device, so this is a decision about the device, not a
bug fix.

**2. `git.html`'s live signup versus what `privacy.html` says.**
`git.html:299` is a working `<form action="https://buttondown.com/api/emails/embed-subscribe/huberttheinventor">`
with a required email field and a required consent checkbox, plus `subscribe.js`
which writes `hti-sticky-dismissed` to `localStorage` with a 30-day expiry.
`privacy.html` says, today: "Nothing is collected from you at the moment. There
is no signup form, no analytics and no cookies on these pages", and describes
Buttondown as a plan ("The list **will** run on Buttondown"). One page collects
addresses; the other says nothing does. I removed the broken analytics tag,
which was unambiguous. The rest is a choice between two edits and I am not
making it for you:
- take the form and `subscribe.js` off `git.html` until the list opens, which
  makes the privacy note true again; or
- rewrite `privacy.html` §001, §002 and §003 to describe Buttondown and
  `localStorage` as fact, before the next reader arrives.
This is the only item on this list with a compliance edge, so it is the one I
would not leave sitting.

**3. `index.html`'s header has no backdrop.** `.topOverlay` reports
`opacity: 0` at every scroll position on the homepage and `opacity: 1` on the
six guide pages. Copy passes under a transparent fixed header on the lower
sections. It reads fine over the dark hero, which may be exactly why it is off.
Fix is to give the homepage the same fixed, opaque-to-34% overlay the guides
have; that changes the top of the homepage, so it is yours.

**4. The system map at 390px.** Internal labels unreadable; legend readable.
Options in §3 above.

**5. The type scale.** Three unit systems, no nameable step, a 10px tier on
phones. Rebuilding it on the `tokens.css` model is the single largest quality
lever and the single largest change.

**6. Three.js on every page.** The refactor is described in §1.5.

**7. `404.html`.** No header, no nav, no footer, no wordmark. Ink starts at
20px from the left where the other pages start at 54px. A reader who mistypes a
URL lands on a page that does not look like the site and offers two links out.

**8. The homepage autoplay loop** needs a pause affordance, or to not autoplay.

**9. `.scanlines:after` animates `background-position`**, not a compositor
property.

**10. The `●` status dot and the marquee bullets** — ornament that the Taste
Skill bans by default. Signature or tell; your call.

**11. Custom cursors** on the homepage — pointer-only, no keyboard equivalent.

**12. `index.html`'s 65 images without intrinsic dimensions.**

**13. Missing `.svg` map exports for guides 03, 04 and 05**, so the "as a
vector" affordance exists on two guides out of five.

**14. `git.html`'s Google Fonts dependency**, where every other page
self-hosts.

**15. The mobile panel's two footer links are still 91.3 x 12 px.** They are
the only tap targets on the site left under 24px that a thumb is meant to hit.
They sit flush against each other with no room above or below, so making them
44px needs a decision about that bottom block: give it its own rule and 24px of
breathing space, drop to one link, or move them into the main list.

---

## Re-verification

The full Playwright pass was re-run against the branch served from
`127.0.0.1:8899`, all ten pages, both viewports, plus a dedicated probe pass and
a separate `reducedMotion: 'reduce'` browser context.

| check | before | after |
|---|---|---|
| focusable elements with a visible ring (first 14 per page) | 1 of 8 sampled, on 9 pages | **14 of 14 on every page**, 2 of 2 on `404.html` |
| `<h1>` in the accessibility tree, `index.html` | 40 | **1** |
| heading sequence, guide pages | `144444` | **`122222`** |
| skip link present | `git.html` only | **all 9 template pages** |
| `role="navigation"` / `role="contentinfo"` | 0 / 0 | **2 / 1 on every template page** |
| `getComputedStyle(html).colorScheme` | `normal` | **`dark`** (`git.html` unchanged at `normal`, correctly) |
| dead in-page anchors | `#map` on `netflix.html` | **none on any page** |
| nav link list, all 9 template pages | four different lists | **identical, 10 links, desktop and mobile** |
| Menu button | 75.7 x 36.9 px at `x294, y30`, `position: fixed` | **44px hit area; box and position identical to `main`: 76 x 37 at `x294, y30`, still `fixed`** |
| open mobile panel, ten links | list `y169-689` over a social block at `y651-675`: **38px overlap**, "The List" printed through | **0 overlap at 390x844, 390x667 and 430x932; social block still at `y651-675` at 390x844** |
| `git.html` focus ring on the midnight plate | `oklch(45% 0.18 40)`, ~2.4:1 against the field | **`oklch(96% 0.09 105)`, the plate's own `--sun`** |
| `git.html` email field | 177 x 21 px @ 13.33px | **350 x 44 px @ 16px** |
| `git.html` consent checkbox | 13 x 13 px | **20 x 20 px**, in a 44px row |
| `git.html` Send button | 57.5 x 21 px | **350 x 44 px** |
| `.topOverlay` on `privacy.html` | absent | **`fixed`, opacity 1** |
| guide video `preload` | `metadata` | **`none`** |
| animations running under `prefers-reduced-motion` | `scanline`, `scanlines`, both `Infinity`, both `running`; mini video `paused: false` | **`[]` on `/`, `/netflix.html`, `/privacy.html`; mini video `paused: true`** |
| horizontal overflow, all pages, both viewports | none | **none** |
| console errors and 4xx/5xx across all ten pages | none of ours | **none** |

Unchanged and still open, as intended: `index.html`'s `.topOverlay` still
reports `sticky` / opacity 0, and the two inline "the map as an image" /
"as a vector" links are still 156 x 16 and 90 x 16. Both are on the
"Not applied" list.

### The screenshot pass caught two of my own regressions

Both were found by looking at the rendered page, not by reading the diff, which
is the whole argument for driving the browser first.

Before-and-after screenshots were compared pixel by pixel at 390x844 on
`index`, `netflix`, `privacy`, `git` and `design-plugins`.

The first version of the tap-target fix used
`display: inline-flex; min-height: 44px`. The diff showed the "Menu" label
sitting **4px lower** on `index`, `netflix` and `design-plugins` — 434 differing
pixels, all inside `x307-356, y41-59`, with the wordmark unmoved, so "Menu" went
from 2px above the wordmark's optical centre to 2px below it. It also
shrink-wrapped the social links.

The second version added `position: relative` so an overlay pseudo-element could
anchor to the button. That was worse and it did not show in the diff, because
the mobile panel had to be opened to see it: the port sets
`header .menu { position: fixed; right: 0; top: 0 }`, `99-hubert.css` loads
last, and a same-specificity `position` declaration wins, so the button dropped
out of the top-right corner into the flow at `x-20, y128.9` with its "M" clipped
by the viewport edge.

Third version, and the one on the branch: no `position` declaration at all. The
button is already positioned, so the overlay anchors to it. Verified against
`main`: `x294, y30, 76 x 37, position: fixed` in both, with a 44px hit area
confirmed by probing above and below the visual centre.

The social links could not use an overlay — they sit flush, 651.2-663.2 and
663.2-675.2, so the second link's overlay swallowed the first and probing every
pixel gave 12px and 45px. Real padding did not fit either, which is how the
panel-overlap blocker in §1.3 was found. They are left at 12px and listed under
"Not applied".

Everything else: the intended visual changes are the header backdrop appearing
on `privacy.html` and the mobile panel's list starting 68px higher.
`git.html`'s first three viewport bands are byte-identical before and after.
