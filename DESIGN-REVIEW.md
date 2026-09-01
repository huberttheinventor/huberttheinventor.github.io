# DESIGN-REVIEW.md — huberttheinventor.github.io

Reviewed **2026-09-01** against the live production site, then re-verified
against this branch (`review/design-fixes`) served locally.

This supersedes the review of 2026-08-26. Everything that review found has been
checked again; where a fix held, it is recorded as held and not re-reported.

---

## Executive summary

Thirteen pages, two viewports, 52 screenshots, every page's console and network
log. **Three blockers, four majors.** All seven are fixed on this branch. Nine
further findings are design-direction calls and are listed, not applied.

The site is in better shape than the finding count suggests. Reduced motion is
fully respected, the focus ring is deliberately tuned and contrast-checked, the
skip link works, landmarks are present via ARIA roles, and the guide-video crop
fixed on 2026-08-29 has held on all seven films at both sizes. `99-hubert.css`
documents its own reasoning better than most production stylesheets.

What went wrong is concentrated in two places, and both are the same kind of
mistake — **a rule that was correct in the reference it was ported from, and
wrong here**:

1. **The dossier strip is pushed off-screen on every guide page, at both
   viewports.** The ported rule cancels a gutter that the strip's parent does
   not have. On a phone the left 54px of every cell in columns 1 and 4 is gone —
   "Annotations" renders as "ations". On desktop the first row is lifted 134px
   above the top of the document, where scrolling cannot reach it, and the strip
   is 374px wider than the screen. The site's own `DESIGN.md` calls this
   component a signature piece; it is currently readable at neither size.

2. **The mobile menu's fifteen links stay in the tab order while the menu is
   shut.** At 390px the desktop nav is `display: none`, so this panel is the only
   navigation — and tabbing past the Menu button walks into fifteen links that
   are clipped invisible, while the button reports `aria-expanded="false"`.

Third blocker: **the newsletter email field had no focus indicator at all** — not
a weak one, none. Two rules cancelled each other and the outline was suppressed
by hand. That is WCAG 2.4.7 Level A on the site's only conversion surface, on all
thirteen pages.

**One correction to a premise in the brief.** GitHub Pages serves every asset
with `Cache-Control: max-age=600` and an ETag — measured on the live site
2026-09-01 with `curl -I` on `99-hubert.css`, `guide-01.mp4`, `guide-01-poster.jpg`
and `index.html`. A stylesheet fix therefore reaches returning visitors after ten
minutes whether or not the token moves; the token is belt-and-braces, not the
gate. It has still been bumped, as instructed, and **109 asset URLs that carried
no token at all** — including all ten guide films and their posters — now carry
one.

**Not found, and worth saying:** no console errors, no failed requests, no dead
links, no dead anchors, no broken images, no horizontal overflow, on any of the
26 page-viewport combinations, before or after.

| | before | after |
|---|---|---|
| blockers | 3 | 0 |
| majors | 4 | 0 |
| console errors / failed requests | 0 / 0 | 0 / 0 |
| assets with no cache token | 109 | 0 |
| distinct cache tokens in use | 2 (one + "none") | 1 |

---

## Findings, ranked

Severity: **blocker** = broken or a Level A accessibility failure on a primary
path · **major** = guideline violation or cross-page inconsistency · **minor** ·
**nit**.

### B1 · blocker · Dossier strip pushed off-screen — every guide page, both viewports

**Where** `assets/css/_slug_.DENrRFxM.css`, selector
`.journalArticle__documentHeader` (the file is a one-line minified bundle; the
selector is the locator). Affects `netflix`, `kubernetes`, `whatsapp`,
`google-search`, `gps`, `git`, `design-plugins`, `alternatives`, `determinant`,
`video-as-code`, `privacy`.

The ported rule declares:

```
margin-left: -15vw; margin-right: -11vw; transform: translateY(-70%);
@media (max-width: 600px) { margin-left: -54px; }
```

Those negative margins cancel a gutter the strip's parent does not have. The
text column's gutter is `padding-left` on `.journalArticle__article` (54px at
390, 259.2px at 1440); the strip is a **sibling** of that block, inside a section
with no horizontal padding. So the margins do not pull it out to the edge, they
push it past it.

Measured on the live site, 2026-09-01:

| viewport | strip x | strip right | width | viewport | first row y |
|---|---|---|---|---|---|
| 390×844 | −54 | 390 | 444 | 390 | 32 |
| 1440×900 | −216 | 1598 | 1814 | 1440 | **−62** |

At 390 the left 54px of every cell in columns 1 and 4 is off-screen: "Annotations"
renders as "ations", "Field guide" as "d guide". At 1440 `translateY(-70%)` =
−134px puts row 1 above the top of the document, where no scrolling reaches it,
and row 2 lands at y=37, under the header.

`html { overflow-x: clip }` (`99-hubert.css:20`) and the port's
`body { overflow-x: hidden }` mean none of this produces a scrollbar — which is
why the page reports no overflow and why screenshot review reads it as a
rendering fault rather than a position fault.

**Ruled out: a tween caught mid-flight.** Identical geometry at t=500ms,
t=4500ms, after a full scroll-settle, and under `prefers-reduced-motion: reduce`
with every GSAP tween disabled. Four conditions, same numbers. It is layout.

**Second, separate collision.** The header has no background (`rgba(0,0,0,0)`),
so it does not occlude — but the HUBERT logotype does. The mark occupies y=4..95
at 390; the strip's first row sat at y=32. The wordmark was drawing over the
dossier's first row. Nothing else on the page is affected: the h1 starts at
y=304 (390) and y=321 (1440), well clear.

**Fix applied** — `assets/css/99-hubert.css:847`. Negative margins and the lift
removed; a top margin clears the wordmark. After: strip at `[0, 110, 390, 134]`
and `[0, 96, 1440, 191]`, no cell off-screen at either size, `elementFromPoint`
at each cell's centre returns the cell itself.

> **House-rule deviation, flagged.** `99-hubert.css:6` says "If a rule here
> overrides a ported rule, that is a bug in the port — fix it there, not here."
> This fix breaks that rule. `_slug_.DENrRFxM.css` is a vendored minified bundle
> with a content-hash filename; editing it in place is hard to review and the
> hash stops matching. Your call whether to move it into the port.

### B2 · blocker · Mobile menu keeps fifteen links in the tab order while shut

**Where** `assets/css/00-critical.css` and `assets/css/default.Z9wDiTTt.css`,
selector `.mobilenav` (`clip-path: rect(0 100% 0 0); pointer-events: none`);
toggle at `assets/js/site.js:183` (`setOpen`). All twelve pages with chrome.

The closed panel is hidden by `clip-path` and `pointer-events: none`. Neither
takes it out of the tab order. At 390×844 the desktop nav is `display: none`, so
this panel is the only navigation present — and tab order runs:

```
1 Skip to the guide   2 HUBERT   3 Menu
4 Index  5 Guide 01  6 Guide 02  7 Guide 03  8 Guide 04 …   (15 links)
```

Measured 2026-09-01: for every one of those, `document.elementFromPoint` at the
focused link's own centre returns the section behind it, not the link — the focus
ring is drawn over page content with nothing under it. `#mobile-navigation`
reports `visibility: visible`, `hidden: false`, `inert: false`, `aria-hidden:
null`, and the Menu button reports `aria-expanded="false"` throughout.

WCAG 2.4.3 Focus Order and 2.4.7 Focus Visible; the `aria-expanded` mismatch is
4.1.2. **Desktop was already clean** — at 1440 the real nav takes focus and this
panel is never reached, confirmed by the same probe.

**Fix applied** — `assets/js/site.js:199`, one line:
`panel.toggleAttribute('inert', !open)`. `inert` closes tab order, the
accessibility tree and pointer events together, without touching the `clip-path`
the reveal animates. After: tab runs Skip → HUBERT → Menu → the reading toggle →
page content, no panel links; opening the menu clears `inert`, sets
`aria-expanded="true"` and the first link is hit-testable.

### B3 · blocker · The newsletter email field has no focus indicator at all

**Where** `assets/css/99-hubert.css:54` (as it was on `main`:
`.sub-form input[type="email"]:focus { outline: none; }`) and `:499`
(`.section__lightgrey .sub-form .field { border-bottom-color: … }`). All thirteen
pages, both the in-page form and — for the outline half — the modal.

Two rules cancelled each other:

1. `outline: none` on `:focus` suppressed the site's own 2px `:focus-visible`
   ring, the one every other control draws.
2. The underline meant to replace it,
   `.sub-form .field:focus-within` (line 56, specificity 0,3,0), is overridden by
   `.section__lightgrey .sub-form .field` (line 499, same specificity, later in
   the file). The plate that carries the in-page form is `.section__lightgrey`,
   so the focus underline never fired there.

Measured 2026-09-01 at both 390×844 and 1440×900, before and after focusing
`#list-email`:

| | outline-style | field border-bottom |
|---|---|---|
| unfocused | `none` | `rgba(17,17,17,.28)` 1px |
| focused | `none` | `rgba(17,17,17,.28)` 1px |

Nothing changes. WCAG 2.4.7 Focus Visible, **Level A**, on the site's only
conversion surface.

The modal copy of the form is not on `.section__lightgrey`, so its underline did
fire — which is why this reads as working if you only test the modal. Both were
measured before concluding.

**Fix applied** — `99-hubert.css:54` (the `outline: none` removed) and `:508` (the
`:focus-within` state restored after the plate rule so it wins). After: outline
`solid`, border-bottom `rgb(17,17,17)` at 2px, from `rgba(17,17,17,.28)` at 1px.

### M1 · major · 404.html shipped with no header, no navigation, no scripts

**Where** `404.html`. Reported no `header` landmark, zero `role` attributes, no
Menu button, no `#mobile-navigation`, no skip link, no `meta description`, and no
`<script>` tags — against twelve pages that have all of them. Someone who
mistypes a URL off a reel landed on a page with exactly two links and no way to
reach guides 02–10.

This is the "hand-duplicated chrome, one page missing a fix" category exactly.

**Fix applied** — the header, mobile nav panel, skip link, `id="main"` and the
four script tags copied verbatim from `privacy.html`, with every `href` rewritten
to an absolute path (the page's own comment already explains why: a 404 can be
served at any depth). Meta description added. After: 1 header, 2 navigation
roles, 14-item nav fingerprint matching the other pages, panel `inert` when shut,
no overflow.

### M2 · major · 109 asset URLs carried no cache token

**Where** all thirteen HTML files. The brief states all ~163 asset URLs share one
`?v=` token. They did not: 326 carried the token and **109 carried none**,
including every guide film and poster (`img/guide/guide-01.mp4` … `guide-10.mp4`,
`guide-NN-poster.jpg`), all 36 homepage images, `img/home/hubert-hero.mp4`, and
`brand/git-logo.svg` / `github-mark.svg`.

This matters most for the films, which do get recut — Guide 09 was recut to 2:55
in commit `62e8fbd`.

**Correction to the premise.** GitHub Pages serves everything
`Cache-Control: max-age=600` with an ETag (measured `curl -I`, live, 2026-09-01,
on four representative URLs). So an untokened asset is stale for at most ten
minutes, not forever. The token is still worth having and has been fixed; it is
not the deploy gate the brief describes it as.

**Fix applied** — token bumped `2026-09-01-video` → `2026-09-01-review` on 167
URLs, and added to the 109 that had none. After: 498 URLs, one token, zero
untokened.

*Worth knowing:* this review's own verification loop was caught by the token —
several CSS edits appeared not to work because the browser kept serving the
cached stylesheet under an unchanged `?v=`. The token does not gate the deploy
(the ten-minute `max-age` does that), but it absolutely gates **iteration**. If
you are editing CSS and the change is not showing, that is the reason.

### M3 · major · Footer social links are 12px tall at 10px type

**Where** `.mobilenav__social a` (`assets/css/00-critical.css`, and
`99-hubert.css:364`). Measured 380×12px at `font-size: 10px`, 390×844, on every
page carrying chrome.

WCAG 2.2 SC 2.5.8 asks 24×24 CSS px of any target that is not inline in a
sentence; this is a standalone row in the menu. The type is also below
`DESIGN.md`'s own stated floor ("apparatus never drops below 14px at 390px").

**Fix applied** — `99-hubert.css:928`: 14px type, `min-height: 44px`, flex-centred.
After: 380×44 at 14px.

### M4 · major · Map caption unreadable on the deep field — video-as-code.html

**Where** `.journalArticle__banner.map figcaption` on `video-as-code.html`.
`rgb(84,86,93)` on `rgb(4,17,31)` at 14px = **2.59:1**, against the 4.5:1 WCAG AA
asks for body text.

**Verified as local, not global, before concluding.** The same class on the light
plate (`rgb(213,214,219)`) measures 5.05:1 and passes. Two cases, opposite
results, so this is one figure sitting on the wrong ground — not a colour-system
error. Eight pages carry a `.map` figure; only this one has a visible caption on
it today.

**Fix applied** — `99-hubert.css:917`, the map's own label ink (`#abbac2`). After:
**9.53:1**. The rule is written against `.journalArticle__banner.map figcaption`
so it covers the other seven map figures too.

### m1 · minor · The "Current" status stamp overflows the viewport — privacy.html, 390px

**Where** `.journalArticle__documentStamp`, mobile tier (`font-size: 34px` flat,
`assets/css/_slug_.DENrRFxM.css`). `privacy.html` only.

The stamp is a fixed 34px whatever word it carries. "Filed" — the value on all
ten guides — sets 118px and fits its cell. "Current", the only other value in the
site, sets 157px against a 113px content box.

**This was already broken on the live site**, and the review's own before/after
screenshot pass initially read it as a regression. It is not: measured 2026-09-01
at 390×844 on production, the stamp's right edge was at **406** against a 390
viewport — the T was cut. Removing the strip's negative margin (B1) narrowed the
cell from 148px to 130px and made it **424**. So the branch aggravated a
pre-existing defect rather than introducing one, and it would have been wrong to
ship B1 without also handling this.

**Fix applied** — `99-hubert.css`, mobile tier: the stamp is aligned to the end of
its cell. After: 384 at 390, inside the viewport, and a 1px no-op for "Filed".
Visually checked at 390×844 on both `privacy` and `netflix`: roughly 50–60px of
clear space between the stamp's ink and the PAPER/PANEL buttons to its left, no
contact, all six labels still aligned to the same 8–9px offset.

**Not fixed, and it is yours:** the stamp cannot size itself to its own word in
CSS. Any `font-size` fix shrinks the stamp on all eleven pages to suit one. The
alignment is a stopgap; a longer status value in future will overflow again.

### m2 · minor · Nav "Sources" on index and privacy points into Guide 01

`index.html` and `privacy.html` link Sources to `netflix.html#sources`; the ten
guides link to their own `#sources`. Not a bug — those two pages have no sources
section — but it is the homepage-leads-with-Guide-01 pattern showing up in the
nav. **Not applied**: it is part of the front-page question that is yours.

### m3 · minor · The design system has no type scale

17 distinct rendered sizes at 390px across the thirteen pages:

```
10 · 12.2 · 13.5 · 14 · 15 · 17 · 17.6 · 20 · 24 · 30 · 34 · 36 · 39 · 40 · 42 · 78 · 135
```

Adjacent ratios in the small tier run 1.03–1.25. Several pairs are within 4–7% of
each other — 14/15, 17/17.6, 39/40/42, 12.2/13.5 — below the threshold at which a
step reads as deliberate. The fractional values (12.2, 13.5, 17.6) come from
percentage inheritance rather than declaration.

Spacing is the same story: **29 distinct values** including 1, 2, 3, 4, 5, 6, 7
and 8px, which cannot all be meaningful.

**Not applied.** Collapsing a type scale is a design-direction call. See the
proposal at the end.

### n1 · nit · 39 duplicate `<h1>` on the homepage

`index.html` renders 40 `<h1 class="marqueeText__title lead">`, all reading
"●Field Guides To Large Systems". **39 of them carry `aria-hidden="true"`** — they
are marquee repeats and assistive technology sees exactly one heading. No user
harm; `<span>` would be the more honest element. Left alone.

---

## Per-tool sections

### 1 · Playwright CLI

`npm install -g @playwright/cli@latest` (v0.1.19), then
`playwright-cli install-browser chromium`. Installed cleanly and drove every
measurement in this document.

Note for whoever runs this next: the `run-code` sandbox has **no `require`, no
`node:` imports and no filesystem**. Scripts must return their result as a string
and let the shell redirect it. `page.screenshot({path})` writes files itself and
is the way to get images out.

Thirteen pages × {390×844, 1440×900}, viewport and full-page capture each — 52
images. Per page: console at error and warning level, `requestfailed` and every
response ≥400, root and per-element overflow, every interactive element's box,
in-page anchor resolution, image and video state, heading outline, landmarks,
form field wiring, nav and footer fingerprints for drift, and the cache-token
inventory.

**Result, live site, before any change:**

- HTTP 200 on all thirteen pages, both viewports.
- **Zero console errors.** One warning, on `index.html` only:
  `THREE.GLTFLoader: Unknown extension "KHR_materials_pbrSpecularGlossiness"`.
  Benign, pre-existing, left alone.
- **Zero failed requests. Zero broken images. Zero dead links. Zero dead
  anchors** (`#kit`, `#main`, `#map`, `#pricing`, `#sources`, `#swaps` all
  resolve). **Zero horizontal overflow** at the root.
- Nav fingerprints: three variants across thirteen pages — the ten guides share
  one, `index`/`privacy` share a second (the `#sources` difference in m1), and
  `404` had none at all (M1). No unintended drift in the guide set.
- Guide video, all seven films, both viewports: `object-fit: contain`,
  `object-position: 50% 50%`, 316×562 at 390 and 405×720 at 1440 — 9:16 in both
  cases. **The 2026-08-29 crop fix has held.** `git`, `design-plugins` and
  `alternatives` carry no film.

**After the fixes, same sweep against this branch:** 26 page-viewport
combinations, **0 problems** — no console errors beyond the pre-existing warning,
no failed requests, no overflow, no broken images, no dead anchors, 498 asset
URLs on a single token.

### 2 · Web Design Guidelines (vercel-labs)

Installed as the `web-design-guidelines` skill
(`npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines`);
already present in `.claude/skills/` and recorded in `skills-lock.json`.

Note the README points the skill at a different repo (`vercel-labs/agent-skills`)
from the one the guidelines live in (`vercel-labs/web-interface-guidelines`).
Both resolve; nothing was half-installed.

**Passes — verified, not assumed:**

- **Reduced motion is fully respected.** Under `prefers-reduced-motion: reduce`,
  **zero** running animations on `index`, `netflix` and `alternatives` — including
  the CRT `scanline` (8s) and `scanlines` (1s) layers, which are gated
  explicitly at `99-hubert.css:405`. `site.js:18` gates every GSAP tween. This is
  better than most animation-heavy sites manage.
- **Focus ring** is defined at `99-hubert.css:278` on `:focus-visible` (not
  `:focus`), 2px, offset 3px, resolved off the plate's text colour, with the
  contrast worked out in the comment. Verified drawn on the first 14 focusable
  elements of `index` and `netflix`, all in view.
- **Skip link** present and first in tab order on all twelve chrome pages, and
  now on `404` too.
- **Landmarks** present via ARIA roles, not elements: `role="navigation"` on both
  navs, `role="contentinfo"` on the footer. `<nav>`/`<footer>` elements would be
  more idiomatic but this is not a violation — flagged as a nit, not applied.
- **Form wiring** is correct: `type="email"`, `autocomplete="email"`,
  `inputmode="email"`, `required`, a real `<label>`, and **20px font-size** on the
  input, which is above the 16px threshold below which iOS Safari zooms on focus.
  Consent is a `required` checkbox in a wrapping label.
- **Consent checkbox target**: the input is 20×20, under the 24×24 minimum *in
  isolation* — but it sits in a wrapping `<label>` measuring 316×116 with
  `min-height: 44px` set deliberately at `99-hubert.css:77` ("the whole row is the
  tap target"). Clicking the text toggles it, so the target is the label. **Not a
  violation.** Recorded here because it looks like one in an automated scan.
- **`touch-action: manipulation`** on all interactive elements
  (`99-hubert.css:369`) removes the 300ms double-tap delay.
- Every page: `lang="en"`, a title, a meta description (`404` excepted before
  M1), one non-hidden `<h1>`, `<main>` present.

**Failures:** B2, B3, M3 above. Contrast: exactly one failure site-wide (M4);
every other text/background pair on all thirteen pages clears AA at 390px on the
default plate.

### 3 · Taste Skill

Installed as `design-taste-frontend`
(`npx skills add https://github.com/Leonxlnx/taste-skill`); already present, with
`hallmark` alongside it. Recorded in `skills-lock.json`.

Judged as a designer, character taken as given.

**What is genuinely good.** The filing-cabinet conceit is carried all the way
down: `Nº001`, the red rubber `FILED` / `CURRENT` stamp, "Nothing filed here." on
the 404, the reading-plate toggle sitting as one more cell in a field table
rather than as a settings widget. The scanline and vignette are restrained —
present at both sizes, never loud. The stretched `textLength` wordmark and the
full-bleed colour plates are doing real work. `design-plugins` has the only
*body* region that looks designed rather than defaulted: the `Plugins.PKG` row
with its vertical rule and the numbered mono list.

**Where the execution falls short of the concept.**

- **The article body is the weak surface, and it is the surface people came
  for.** Between the dossier strip and the first video, every guide is a
  left-aligned column of near-black prose on light grey — h1, deck, h2,
  paragraph. No rules, no margin marks, no mono furniture, none of the filing
  language the header, the stamp and the 404 establish. Above the fold on a
  phone, `kubernetes`, `whatsapp`, `google-search`, `gps`, `determinant` and
  `video-as-code` are hard to tell from any long-read with a CRT filter over it.
  Fixing B1 helps — the dossier is now visible, which puts one piece of
  apparatus on screen — but the body itself is untouched.
- **The deck has no separation from the h1.** On every guide the standfirst
  begins on the next line at a size close to the h1's, so the two read as one
  slab rather than a headline and a deck. Worse on mobile, where the slab takes
  most of the first screen.
- **Desktop leaves the sides empty.** A ~936px column centred in 1440 with ~259px
  of unused plate either side, and >200px of empty background above the h1.
- **Single-word orphans on wrapped h1s** — `alternatives` ("twin."), `privacy`
  ("not."), `determinant` mobile ("volume."), `netflix` ("hard part."). One
  declaration (`text-wrap: balance`) fixes all of them.
- **The native `<video>` control bar** is the least on-brand element on the site,
  sitting inside the most carefully composed frame on the page.

All of the above are design-direction calls. None applied.

### 4 · Awesome Design

Cloned (`git clone https://github.com/VoltAgent/awesome-design-md`); the
collection is 74 `DESIGN.md` files with no installer, so it was used as the
comparison bar, which is what its README asks for.

**The site already has a `DESIGN.md`, and it is at the corpus bar.** Against
`claude`, `vercel` and `apple` from the collection (562–736 lines), this site's
364 lines carry the same front-matter keys (`colors`, `typography`, `rounded`,
`spacing`, `breakpoints`) and the same prose sections (Overview, Colors,
Typography, Layout, Shapes, Components, Do's and Don'ts, Responsive Behavior) —
plus a **Contradictions** section that no file in the collection has. That
section is the best thing in the document and is above the bar, not at it.

**Gaps against the corpus, fixed on this branch:**

- The `description` front matter still said *"One page, git.html, does not use
  this system at all and runs a separate warm-paper editorial system of its
  own."* The document contradicted itself: line 319 already recorded that commit
  `25adfcc` rebuilt `git.html` on System A. Corrected.
- `breakpoints` still listed two `git.html`-only breakpoints as live. Corrected.
- No **Touch Targets** subsection under Responsive Behavior, which the corpus
  files carry — and this review found three target-size questions. Added.
- The four contradictions this review measured, added to that section.

**Where the site contradicts its own system** (all now recorded in `DESIGN.md`):

| `DESIGN.md` says | the site does |
|---|---|
| apparatus never below 14px at 390px | dossier cells were 10px until 2026-08-29; `.mobilenav__social a` was 10px until this branch |
| a stated type scale | 17 distinct rendered sizes, adjacent ratios 1.03–1.25 |
| — | 29 distinct spacing values, including 1–8px |
| the document header is "pulled out into the margins" as a deliberate device | the pull put it off-screen at both viewports (B1) |

---

## Deliberately NOT applied — these are yours

1. **Reel attribution is on 3 of 10 guides.** `git`, `design-plugins` and
   `alternatives` open with a "You commented GIT — this is the ladder." kicker
   and carry a *"Companion to the reel · Watch it on @huberttheinventor"* credit.
   `netflix`, `kubernetes`, `whatsapp`, `google-search`, `gps`, `determinant`
   and `video-as-code` have neither — verified by grep across all ten files.
   Given the audience arrives from reels, this is the most valuable thing on this
   list. Not applied because it means writing seven new kickers, which is copy,
   not markup.
2. **The homepage leads with Guide 01** — flagged as instructed, untouched.
3. **System maps unreadable on a phone** — known, untouched. Confirmed still
   present: the map is drawn in a 1200-unit viewBox, so caption type renders
   ~2.7px at 390px regardless of declared size.
4. **Collapse the type scale** from 17 sizes to a stated ramp, and the spacing
   set from 29 values to a unit. Mechanical once the ramp is chosen; the ramp is
   yours.
5. **Give the deck separation from the h1** on every guide — one margin, biggest
   single readability win on the primary viewport.
6. **`text-wrap: balance` on h1** — kills every orphan at once.
7. **The article body carries none of the site's own furniture.** The largest
   design opportunity here, and entirely a direction call.
8. **"The List" is behind the hamburger on mobile.** On desktop it is a distinct
   green-dotted CTA in the nav; on the viewport that carries the audience it is
   one tap away and invisible. Probably deliberate — worth deciding on purpose.
9. **Use `<nav>` and `<footer>` elements** instead of divs with roles. No
   accessibility gain, purely idiomatic.

Also unresolved by choice: whether the dossier strip should bleed to the viewport
edges at all, or sit in the text column with the h1. B1's fix restores every cell
to the screen using the bleed the original rule was reaching for; the alternative
is a design decision.

---

## Verification of this branch

- Full 26-combination Playwright sweep re-run against the branch: **0 problems**.
- B1: strip `[0,110,390,134]` and `[0,96,1440,191]`, no cell off-screen,
  `elementFromPoint` returns the cell itself at both sizes.
- B2: `inert` present when shut; tab order clean of all 15 links; opening clears
  `inert`, sets `aria-expanded="true"`, first link hit-testable.
- B3: outline `none`→`solid`, border `rgba(17,17,17,.28)` 1px →`rgb(17,17,17)` 2px.
- M1: `404` has 1 header, 2 nav roles, skip link, `#main`, meta description,
  14-item nav matching the other pages.
- M2: 498 URLs, one token, zero untokened.
- M3: social row 380×12 @10px → 380×44 @14px.
- M4: 2.59:1 → 9.53:1.
- Visual before/after comparison of the changed pages at both viewports.

**Not pushed. No PR opened.**
