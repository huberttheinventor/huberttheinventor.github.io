# Proposal — the reading plate, and the device behind it

Date: 2026-08-29 · Decision owner: founder · Status: awaiting a pick

Follows `DESIGN-REVIEW.md` §"Not applied" item 1, which raised this and correctly
left it as a palette decision. This adds the measurement that item was missing,
which changes what the decision actually is.

---

## What is shipped, measured today

Live site, Chromium at 390×844, opacity composited against the plate:

| Element | Contrast | WCAG AA (below 24px) |
|---|---|---|
| Article body on `.section__lightgrey` | **4.00:1** | needs 4.5:1 — fails |
| Table headers (`opacity: .55`) | **2.29:1** | fails |
| Eyebrow labels (`.opacity__50`) | **2.12:1** | fails |
| System map SVG labels | **2.7px rendered** | unreadable |
| Sub-44px tap targets | 13–14 per guide | — |

Same on `git.html`, `netflix.html` and `kubernetes.html`. `#71737d` is the
surface every article on the site is read on, plus `privacy.html` and `404.html`.

## The finding that changes the decision

`DESIGN-REVIEW.md` offered three one-line palette fixes and recommended
`#7b7d87` (4.61:1). All three were scored **at full opacity**, and the system
does not dim its apparatus at full opacity — it dims with `opacity: .5` / `.55`
/ `.6`. Scored the way the site actually renders:

| Plate / ink | Body | At `.55` | Verdict |
|---|---|---|---|
| `#71737d` / `#111111` (shipped) | 4.00:1 | 2.29:1 | fails outright |
| `#7b7d87` / `#111111` (the review's pick) | 4.61:1 | **2.46:1** | body ok, apparatus still fails |
| `#8e909a` / `#111111` | 5.94:1 | **2.77:1** | body ok, apparatus still fails |
| `#c3c5cc` / `#111111` | 10.95:1 | **3.54:1** | body ok, apparatus still fails |
| `#d5d6db` / `#111111` | 13.01:1 | **3.74:1** | body ok, apparatus still fails |
| `#71737d` / `#ffffff` | 4.72:1 | **2.60:1** | body ok, apparatus still fails |
| `#22242b` / `#d2d4da` | 10.46:1 | **4.19:1** | body ok, apparatus still fails |

**No plate colour fixes this.** Not even a near-white one. The binding
constraint is the dimming device, not the grey.

So the decision has two parts, and the first one is not about colour:

1. **Replace opacity-dimming with an explicit dim ink on this plate.** Dimming
   with opacity is one of the system's signature devices (`DESIGN.md` → Do's:
   "dim it with opacity rather than a second grey"), so this contradicts the
   documented system on purpose and needs your sign-off. The look barely
   changes; what changes is that the dim tier gets a value that can be checked.
2. **Then pick the plate.** With a real dim ink, all three options below pass.

## The three options

Each was rendered over the real live pages and re-measured, not calculated.

| | Plate | Body ink | Dim ink | Body | Apparatus | Map |
|---|---|---|---|---|---|---|
| **R1** Minimal lift | `#8e909a` | `#111111` | `#1f2128` | 5.94:1 | 5.06:1 | 13.8–15px |
| **R2** Printed page | `#d5d6db` | `#111111` | `#54565d` | 13.01:1 | 5.05:1 | 13.8–15px |
| **R3** Dark plate | `#22242b` | `#d2d4da` | `#91939a` | 10.46:1 | 5.05:1 | 13.8–15px |

- **R1** keeps the site looking exactly like itself. Smallest change that clears
  AA. Recommended if the current look is settled and this is a compliance fix.
- **R2** makes the plate an actual sheet of paper laid on the instrument panel,
  which is what `DESIGN.md` says the site *is*. Best legibility, biggest change.
- **R3** merges the guide into the CRT canvas — closest to the reels, most
  cinematic. Long prose on dark is harder for some readers; it is the option
  most likely to be a taste call rather than a legibility one.

All three also restore a keyboard focus ring, which nine of the ten pages
removed (`00-critical.css` → `a { outline: 0 }`) and never replaced.

## The system map — separate problem, not solved here

SVG `<text>` scales with the viewBox. At 390px the map renders at 0.244 scale,
so an 11px declaration renders 2.7px. Declaring 44px would render 10.7px. **Font
size cannot fix this.** The previews use a stopgap — natural width restored
inside a horizontal scroller, labels at 13.8–15px — which is legible but asks
the reader to scroll a diagram.

The real fix is a second, narrow layout per guide: stacked, real HTML text, no
viewBox. Five guides, and it is not a palette decision, so it is deliberately
excluded from this choice. Recommend scheduling it straight after.

## To see it

```
node serve-variants.mjs <scratchpad> 8788   # serves this repo read-only
http://127.0.0.1:8788/compare.html
```

Baseline and all three options, side by side at 390px, on the real pages. The
override is injected at serve time; nothing has been written into this repo.

## Also open, unrelated to palette

`privacy.html` states "There is no signup form, no analytics and no cookies on
these pages" while `git.html` runs a working Buttondown form and `subscribe.js`
writes to `localStorage`. `DESIGN-REVIEW.md` flagged this as the one item with a
compliance edge and the one not to leave sitting. It is still sitting.
