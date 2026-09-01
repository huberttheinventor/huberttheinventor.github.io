---
version: alpha
name: hubert-field-guides-design-analysis
description: "A dark, CRT-flavoured field-guide system built on a near-black canvas (#1a1a1a) with a light-grey ink (#bababa), plus one near-white reading plate (#d5d6db, reader-switchable to #22242b) that carries every article body and one saturated indigo plate (#03049c) that carries every footer. Display type is SemiSqueezed, a very narrow grotesque, set enormous and viewport-scaled; body prose is Graphik; all apparatus (labels, captions, numbers, buttons, tables) is PP Neue Montreal Mono, uppercase and letterspaced. There are no cards and no shadows: hierarchy is carried by full-bleed colour plates, hairline rules, and one link-row component that spans the full column with a trailing arrow. Persistent fixed overlays (scanline, gloom, vignette) sit above everything to give the CRT read. All thirteen pages run this one system: git.html was rebuilt onto it in commit 25adfcc and the second system is dead."

extracted: 2026-08-26
method: "Values read from assets/css/00-critical.css :root and from getComputedStyle in Chromium at 390x844 and 1440x900 against the live site. Sizes marked (computed) are rendered pixel values, not declarations."

colors:
  canvas: "#1a1a1a"          # --bgcolor, <body> background on all 9 template pages
  ink: "#bababa"             # --primarycolor / --grey, default text
  ink-dim: "#111111"         # --black, text colour on the mid-grey plate
  plate-read: "#d5d6db"      # --plate-read, article body, default "paper" theme
  plate-read-panel: "#22242b"  # --plate-read under [data-reading=panel]
  plate-read-ink: "#111111"    # 13.01:1 on paper / #d2d4da, 10.46:1 on panel
  plate-read-dim: "#54565d"    #  5.05:1 on paper / #91939a, 5.05:1 on panel
  plate-read-legacy: "#71737d" # what --lightgrey was until 2026-08-29; 4.00:1, retired
  plate-deep: "#111111"      # --black, section__black
  plate-accent: "#03049c"    # --blue, every footer
  accent-warn: "#ff001a"     # --red
  accent-cool: "#9fe4f3"     # --lightblue
  accent-warm: "#bab5a6"     # --cream
  accent-green: "#00ff00"    # --green
  accent-mauve: "#a7849d"    # --pink
  map-field: "#04111f"       # inline in 99-hubert.css, background of every system map
  map-line: "#79b0cc"        # inline SVG, diagram linework
  map-label: "#abbac2"       # inline SVG, diagram label text
  map-note: "#faf6af"        # inline SVG, diagram annotation
  map-mute: "#7a8990"        # inline SVG, secondary linework
  hairline: "hsla(0,0%,100%,.7)"   # --border
  hairline-fade: "hsla(0,0%,100%,.5)"  # --borderFade

typography:
  wordmark:
    fontFamily: SemiSqueezed
    note: "SVG <text> stretched with textLength to a 744x135 viewBox; renders 135px at every viewport (computed)"
  display-hero:
    fontFamily: SemiSqueezed
    declared: "20vw / 15vw / 10vw depending on block"
    computed390: 78px
    computed1440: 172.8px
    lineHeight: 0.9
  h1:
    fontFamily: SemiSqueezed
    declared: "6vw, floored to 62px at <=1300px and 40px at <=600px"
    computed390: 40px
    lineHeight: 0.9
  h4-as-section-head:
    fontFamily: SemiSqueezed
    declared: "6vw, 10vw at <=600px"
    computed390: 39px
    computed1440: 86.4px
    lineHeight: 0.85
  lead:
    fontFamily: Graphik
    computed390: 30px
    computed1440: 63.6px
  body:
    fontFamily: Graphik
    computed390: 20px
    computed1440: 40.3px
    note: "the single most-used size on every guide page (computed)"
  apparatus:
    fontFamily: Mono
    computed390: 14px
    computed1440: 17.1px
    transform: uppercase
    note: "labels, captions, buttons, table cells, footer"
  apparatus-small:
    fontFamily: Mono
    computed390: 10px
    computed1440: 12.2px
    note: "eyebrows, stamp fields, status labels"
  table-head:
    fontFamily: Mono
    computed390: 13px
    letterSpacing: -0.048em
    opacity: 0.55

fonts-shipped:
  - SemiSqueezed (SemiSqueezedMedium.woff2, 42KB) - display + wordmark
  - Graphik (Regular 36KB, Extralight) - body prose
  - Mono = PP Neue Montreal Mono Book (59KB) - all apparatus
  - GeistMono - "@font-face declared, never referenced by any rule"

rounded:
  radius-token: "var(--radius) = .5vw, overridden to 1vh"
  also-in-use: ["0", "8px", "12px", "999px"]
  note: "not a scale; see Contradictions"

spacing:
  unit: "vw, with px overrides at 1300px and 600px"
  section-padding: "5vw 0 10vw, becomes 30px 0 60px at <=600px"
  in-use: [".2vw", ".5vw", "1vw", "1.5vw", "2vw", "3vw", "4vw", "5vw", "6vw", "8vw", "10vw", "20vw", "30vw"]
  note: "no named spacing tokens exist"

breakpoints:
  - "max-width: 1300px"
  - "max-width: 600px"
  - "max-width: 560px (list modal goes full-bleed)"
  note: "the two git.html-only breakpoints listed here until 2026-09-01 died with System B"
---

# DESIGN.md — huberttheinventor.github.io

The de-facto design system of the live site, extracted 2026-08-26. This describes
what the site **is**, not what it should be. Where the system contradicts itself,
that is recorded under Contradictions rather than smoothed over.

Two systems are in the repo. This document describes **System A**, which runs on
nine of the ten pages. **System B** (`tokens.css`, used only by `git.html`) is
described at the end.

---

## Overview

The page is a dark instrument panel that a printed field guide has been laid onto.
The canvas is near-black. Three fixed overlays (`.scanlines`, `.gloom`,
`.vignette`) sit above the whole document at z-index 22, 23 and 100, giving the
CRT read; the scanline layer runs at 0.25 opacity (computed) and animates
continuously.

Content is organised as **full-bleed colour plates**, never cards. A plate rebinds
`--background` and `--color`; every child resolves off those two variables. There
are four plates:

| class | background | text |
|---|---|---|
| `.section__grey` | `#1a1a1a` | `#bababa` |
| `.section__black` | `#111111` | `#bababa` |
| `.section__lightgrey` | `#71737d` | `#111111` |
| `.section__blue` | `#03049c` | `#bababa` |

Every guide page is exactly two sections: one `.section__lightgrey` carrying the
whole article, one `.section__blue` carrying the footer. The homepage runs eight
sections and uses all four plates.

Divider language is hairline-only: `1px solid hsla(0,0%,100%,.7)`. There are no
shadows and no elevation. Depth is done with colour plates and the fixed CRT
overlays.

## Colors

### Canvas and ink
- `--bgcolor #1a1a1a` — the page. Never pure black.
- `--primarycolor` / `--grey #bababa` — default text on dark plates. 8.97:1 on
  the canvas (computed).
- `--black #111111` — text on the mid-grey plate, and the `.section__black`
  plate itself.

### The reading plate
- `--lightgrey #71737d` — the background of every article body on every guide,
  and of `privacy.html` and `404.html`. This is the surface almost all reading
  happens on.

### Accents
- `--blue #03049c` — footer plate, site-wide.
- `--red #ff001a`, `--lightblue #9fe4f3`, `--cream #bab5a6`, `--green #00ff00`,
  `--pink #a7849d` — declared in `:root`; used sparingly or not at all in the
  shipped pages.

### Diagram palette (separate, inline)
The system maps carry their own colours inline from the poster file so the page
cannot drift from the downloadable artefact: field `#04111f`, linework `#79b0cc`,
secondary `#7a8990`, labels `#abbac2`, annotation `#faf6af`. This is a deliberate
sealed sub-palette and is the most disciplined colour decision in the system.

## Typography

### Families, and what each is allowed to do
- **SemiSqueezed** — display only. The wordmark, every heading, every marquee
  line. A very narrow grotesque; it is what makes the site recognisable at a
  glance.
- **Graphik** — running prose only.
- **Mono** (PP Neue Montreal Mono) — all apparatus: eyebrows, captions, button
  labels, table cells, footer, status fields. Always uppercase, always
  letterspaced.

The role separation is clean and is the system's strongest idea.

### Scale
The scale is **viewport-derived, not stepped**. Headings are declared in `vw`
(`20vw`, `15vw`, `10vw`, `6vw`, `5vw`, `4vw`, `3vw`), body-adjacent sizes in
percentages (`260%`, `250%`, `150%`, `130%`, `100%`, `90%`, `80%`, `70%`, `55%`,
`50%`), and floors are set in px inside the two breakpoints. Rendered result
(computed, guide pages):

| role | 390px | 1440px |
|---|---|---|
| hero marquee | 78px | 172.8px |
| section head | 39px | 86.4px |
| lead | 30px | 63.6px |
| body | 20px | 40.3px |
| apparatus | 14px | 17.1px |
| apparatus small | 10px | 12.2px |

The gap between apparatus (14px) and body (20px) at 390px is one step; the gap
between body and section head is more than 19px. That canyon is intentional and
reads well. The 10px tier does not.

### Measure
No max-width on body prose in System A. On the guide pages the article column is
constrained by its container; on the homepage several mono blocks fall to roughly
a 170px column at 390px.

## Layout

- 12-column substrate is declared (`--columns: 20`) but layout is done with
  flex and percentage widths, not a grid.
- `.layout` is a full-bleed 100vw device; the document header is pulled into the
  margins with negative margins; marquee tracks run to several thousand px.
  `html { overflow-x: clip }` in `99-hubert.css` is what keeps the root from
  scrolling sideways. Verified: root `scrollWidth` equals `clientWidth` on all
  ten pages at both viewports.
- The header is `position: fixed`, 99px tall (computed), transparent, z-index 21.
  A separate `.topOverlay` element supplies its backdrop.

## Shapes

`--radius` is `.5vw`, overridden to `1vh`. Five rules use it. Four other rules
hard-code `8px`, `12px`, `0` and `999px`. There is no radius scale.

## Components

### Link row (`.button.button__big`)
The site's only call to action. A full-width row with a 1px rule above and below,
a mono uppercase label on the left and a `↗` arrow on the right. On hover a fill
wipes up from the base and the label indents. This is the one component that
appears on every page including `404.html`, and it is the system's second-
strongest idea.

### Marquee (`.marqueeText`)
A horizontally scrolling track of repeated display lines, each prefixed by a `●`.
Used five times on the homepage. Each repetition is a full `<h1>`.

### System map (`.map`)
A figure with its own `#04111f` field, `var(--radius)` corner, `3vw` padding, an
inline SVG drawing, and a hairline-topped legend of flex items with 26px colour
rules. Present on guides 01 to 05.

### Document header / stamp (`.journalArticle__documentHeader`)
The dossier masthead: a small field table (Field guide / Status / Filed) in
10px mono at 0.55 opacity, with a rotated "FILED" stamp at 34px, 0.55 opacity,
in a desaturated red.

### Reference table
Hairline under every row, mono uppercase `th` at 13px / 0.55 opacity, first
column mono with tabular numerals. Defined in `99-hubert.css`.

### Reading toggle (`.readingToggle`)
Two mono buttons, Paper / Panel, living as one more cell in the dossier document
header — that block is already a field table of apparatus, so the control needs
no new furniture. `aria-pressed` carries the state; both buttons are 44px tall.
Hidden until the boot script adds `.reading-ready` to `<html>`, so a reader
without JavaScript is never shown a control that cannot work; they get the
default paper plate, which is the more legible of the two. The choice is stored
in `localStorage` under `hubert:reading` and is disclosed in `privacy.html`.

### Header and mobile menu
Wordmark left (SVG, `textLength`-stretched), inline link list centre on desktop,
a text-only "Menu" button on mobile that opens `#mobile-navigation`.

### Video
Native `<video controls preload="metadata" playsinline>` with a poster and a
WebVTT subtitle track. Caption placement is lifted 44px in `99-hubert.css` to
clear the native control bar.

## Motion

- One easing family, GSAP `power2/power3` plus a `cubic-bezier(.22,.61,.36,1)`
  in `99-hubert.css`.
- Lenis smooth scroll drives the scroll position; ScrollTrigger is bound to it.
- Text arrives through Splitting.js in three flavours keyed off markup
  attributes: `effect__titleRandom` (character-by-character, out of order),
  `effect__textFade` (word by word, scrubbed to scroll), and a default rise.
- `site.js` reads `prefers-reduced-motion` once at load into a `reduced` const
  and gates the smooth scroll, the reveals, the marquee coupling, the section
  overlays, the hero fade and the branding frame off it. This is thorough.
- The CRT overlay animations are pure CSS and are **not** gated (see
  Contradictions).

## Do's and Don'ts

### Do
- Use a full-bleed plate to change register. Never a card.
- Keep the three font roles sealed: display for headings, Graphik for prose,
  Mono for everything that is apparatus.
- Set apparatus uppercase with positive tracking. Dim it with opacity **on the
  dark plates only**, where the device still measures above 4.5:1. On the
  reading plate use the explicit `--plate-read-dim` ink instead — see
  Contradictions 2 and 3, which this rule replaced on 2026-08-29.
- Use the hairline link row for every outbound action.
- Give diagrams their own field and their own colour set, and inline those
  colours from the source artefact.
- Keep numerals tabular in tables.

### Don't
- Don't introduce a shadow or a card.
- Don't add a fourth typeface.
- Don't put display type in italic.
- Don't add a second accent to a plate.
- Don't let apparatus text drop below 14px at 390px.

## Responsive Behavior

- Breakpoints: 1300px and 600px. Everything between is fluid `vw`.
- At 600px the method rows stop floating and diagrams take the full column
  (documented deviation in `99-hubert.css`, founder's call 2026-08-18).
- Root horizontal scrolling is clipped rather than hidden, so `position: sticky`
  backdrops keep working.

### Touch Targets

Added 2026-09-01. WCAG 2.2 SC 2.5.8 is the floor: **24x24 CSS px** for any target
that is not inline in a sentence. The system's own rule is stricter where it can
be — 44px — and `touch-action: manipulation` is set on every interactive element
so nothing carries the 300ms double-tap delay.

- Link rows (`.button__big`), menu links, the reading toggle and the modal close
  all set `min-height: 44px`.
- **Inline links inside running prose are exempt** and are left at their line
  height. An automated scan will flag them; they are not violations.
- **A labelled checkbox's target is its label.** `.sub-form .consent input` is
  20x20, under the minimum on its own, but sits in a wrapping `<label>` with
  `min-height: 44px` — clicking the text toggles it, so the target is 316x116.
  Do not "fix" the input's box.
- Measured 2026-09-01: `.mobilenav__social a` was the one real failure at
  380x12 and 10px type. Now 380x44 at 14px.

## Contradictions in the system as shipped

These are the places where the site does not obey itself. They are the input to
`DESIGN-REVIEW.md`; severities and fixes live there.

1. ~~**Two design systems.**~~ **Resolved 2026-08-26** by commit 25adfcc, which
   rebuilt `git.html` on System A. All ten template pages now load the same
   bundle. `tokens.css` is still in the repo and is no longer referenced by any
   page; it is dead and should be deleted. (This entry described the site as it
   was when extracted; it was already stale by the time it was next read.)
2. ~~**The reading plate fails its own ink.**~~ **Resolved 2026-08-29.** Was
   `#111111` on `#71737d` = 4.00:1. The plate is now `--plate-read`, defaulting
   to `#d5d6db` (13.01:1) with a reader toggle to `#22242b` (10.46:1).
3. ~~**Apparatus is dimmed below legibility.**~~ **Resolved 2026-08-29.** Was
   2.12:1 and 2.29:1. Opacity-dimming is replaced on this plate by
   `--plate-read-dim` (5.05:1 in both themes), and `th` is lifted from 13px to
   the system's own 14px floor. The measurement that forced the device change:
   even a near-white `#d5d6db` plate leaves `.55`-opacity apparatus at 3.74:1,
   so no plate colour could have fixed this on its own.
4. **No radius scale.** `var(--radius)` plus hard-coded `8px`, `12px`, `999px`.
5. **Three unit systems for type** (`vw`, `%`, `px`) with breakpoint floors,
   so there is no scale you can name a step of.
6. **`--mono` is used but never defined.** `.section .pricing__box--badge` sets
   `font-family: var(--mono)`; no such custom property exists, so the badge
   inherits whatever is above it instead of the mono face.
7. **`obviously` is set as the first family on `.arrow`** and is neither shipped
   nor `@font-face`d, so every `↗` on the site falls back to the system UI sans
   rather than to a face in the system.
8. **`GeistMono` is `@font-face`d and never used.**
9. ~~**Focus has no design.**~~ **Resolved.** `99-hubert.css` now defines a
   `:focus-visible` ring that resolves off the plate's own text colour, so it
   works on all four plates without a per-plate override.
10. **The footer is a `<section class="... footer ...">`, not a `<footer>`,**
    and the nav is a `<div class="nav">`, not a `<nav>`. System B uses the real
    elements.
11. **`color-scheme` is never declared** on a dark site, so native scrollbars
    and form controls render in the light default.
12. ~~**The dossier strip is pushed off-screen.**~~ **Resolved 2026-09-01.** The
    ported rule's `margin-left: -15vw / -54px`, `margin-right: -11vw` and
    `transform: translateY(-70%)` cancel a gutter the strip's parent does not
    have — the gutter is `padding-left` on the sibling `.journalArticle__article`.
    Measured: strip at x=-54 in a 390 viewport and at x=-216, y=-62, width 1814
    in a 1440 one, identical under `prefers-reduced-motion` so not a tween.
    The header comment on `99-hubert.css` describes this pull-out as deliberate;
    the result was clipped content at both sizes.
13. ~~**The signup field has no focus indicator.**~~ **Resolved 2026-09-01.**
    `outline: none` on `:focus` plus a `:focus-within` underline that
    `.section__lightgrey .sub-form .field` overrode by source order. Nothing
    changed on focus, on any page. WCAG 2.4.7, Level A.
14. **There is no type scale.** 17 distinct rendered sizes at 390px across the
    thirteen pages — 10, 12.2, 13.5, 14, 15, 17, 17.6, 20, 24, 30, 34, 36, 39,
    40, 42, 78, 135 — with adjacent ratios of 1.03 to 1.25 in the small tier.
    14/15, 17/17.6, 39/40/42 and 12.2/13.5 are all closer together than a step
    can read as deliberate; the fractional sizes come from percentage
    inheritance rather than declaration. This is contradiction 5 measured.
15. **There is no spacing unit.** 29 distinct values in use, including 1, 2, 3,
    4, 5, 6, 7 and 8px, which cannot all carry meaning. `spacing.note` above
    already says no named tokens exist; this is the size of the gap.
16. **The status stamp is a fixed 34px whatever word it carries.** "Filed"
    (ten pages) sets 118px and fits its mobile cell; "Current" (privacy.html)
    sets 157px and does not — it overflowed the viewport on the live site at
    390px before 2026-09-01. Aligned to the end of its cell as a stopgap; a real
    fix has to size the stamp to its content, which is a design decision.

---

# System B — `tokens.css` (no longer used by any page)

**Dead as of commit 25adfcc**, which rebuilt `git.html` on System A. Nothing
loads this file. Recorded for completeness. It is a warm-paper editorial system: `--paper`
`oklch(96.2% 0.012 85)`, `--ink` `oklch(24% 0.02 250)`, one dark plate
`--midnight` `oklch(17.5% 0.035 250)` lifted from the film, Archivo for display,
Newsreader for prose, JetBrains Mono for apparatus, a 4pt spacing scale
(`--s-3xs 4px` through `--s-4xl 200px`), a `clamp()`-based type canyon with a
deliberate missing rung, hairline-only dividers, one easing, and a focus token
(`--focus`) with a `:focus-visible` rule that is actually applied.

It is the better-documented of the two systems. It is on one page.
