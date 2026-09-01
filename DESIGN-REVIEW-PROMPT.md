# Prompt — design review of huberttheinventor.github.io

Paste everything below the line into a FRESH Claude Code session started in
`C:\Users\julia\projects\hubert-site`.

**Refreshed 2026-09-01.** The previous version of this file was written before
Guides 08, 09 and 10 existed and carried two claims that had since become false
— it told the reviewer that no live signup form existed and that `git.html` was
an off-design page. Both would have sent a review in the wrong direction. If you
are reading this months later, check the "What is true today" section against
reality before pasting.

---

Review this entire website with the design tooling below, then fix what you
find. This is the live production site behind huberttheinventor.github.io
(GitHub Pages, static HTML, no build step — the HTML files ARE the deploy).
Work on a branch; never push without my approval.

## Step 0 — install the tools (don't guess installation)

Install each per its own README's Claude Code instructions (skill/plugin
mechanism as the repo specifies — read the README first, don't improvise):

1. Taste Skill — https://github.com/Leonxlnx/taste-skill
2. Web Design Guidelines — https://github.com/vercel-labs/web-interface-guidelines
3. Awesome Design — https://github.com/VoltAgent/awesome-design-md
4. Playwright CLI — https://github.com/microsoft/playwright-cli

If one can't be installed cleanly, say so and continue with the rest — do not
half-install and pretend.

## What is true today (2026-09-01)

- **Thirteen pages.** `index.html`; ten guides — `netflix`, `kubernetes`,
  `whatsapp`, `google-search`, `gps`, `git`, `design-plugins`, `alternatives`,
  `determinant`, `video-as-code`; plus `privacy.html` and `404.html`.
- **One design system now.** Every page loads the same seven stylesheets.
  `git.html` used to be an off-design paper-style page and is not any more —
  judge it like any other page. Do not carry forward "known off-design"
  exemptions from an older review.
- **The email list is LIVE and is a first-class surface.** Buttondown embed on
  every page plus a list modal that fires on scroll. Earlier versions of this
  prompt said no signup form existed and that its absence was deliberate; that
  is out of date. Conversion, consent copy, focus handling and mobile keyboard
  behaviour on that form all matter.
- **Static export, hand-duplicated chrome.** Header, nav and footer are copied
  into all thirteen pages by hand. Cross-page inconsistency (nav drift,
  differing boilerplate, one page missing a fix) is a first-class defect
  category — real nav bugs have shipped from exactly this.
- **Audience: developers arriving from Instagram and TikTok reels, on PHONES.**
  Mobile is the primary viewport, desktop secondary.
- **Every guide film is vertical** (720×1280 or 1080×1920) and sits in
  `.guideVideo`.

## Landmines specific to this repo

- **A CSS or JS change is not deployed until the cache token moves.** All ~163
  asset URLs carry one shared `?v=<token>`. A stylesheet fix pushed without
  bumping it reaches nobody who has visited before. Bump it in the same commit.
- **The site is cloned TWICE locally** — `projects/hubert-site` and
  `projects/huberttheinventor.github.io`, same remote, both on `main`. Work in
  one, and check the other is not stale before trusting anything you read there.
- **`professor_hubert_j_farnsworth/site/` is NOT this site.** It is a superseded
  design that still exists in the video repo. Anything sourced from it will be
  wrong — this has already caused three rejected design attempts.

## Already known — report only if you find something NEW about them

Do not spend the review re-discovering these. All were found and handled on
2026-09-01:

- Guide videos were cropped to their top 43% on desktop (`object-fit: cover`
  from the global reset beating `.guideVideo video`). **Fixed** — now centred,
  `contain`, whole frame. Verify it held; do not re-report it.
- The site claimed "eight guides" in 45 places when it had ten. **Fixed.**
- No `sitemap.xml` and no `robots.txt`. **Both added.**

## Known open, and NOT yours to decide

- **The homepage leads with Guide 01.** It names Guide 01 twenty-four times and
  Guide 02 fourteen; every other guide appears twice, as nav links. Changing it
  means rewriting hero copy and replacing five stills. Flag anything you find,
  but do not restructure the front page.
- **The system maps are unreadable on a phone** — the map caption measures
  ~2.68px at 390px wide, identically on every guide, so it is the shared map
  component rather than one drawing. A horizontal-scroll fix was built and
  rejected. A real fix means redrawing the maps in a phone-shaped viewBox.
- **Palette, type scale and layout direction are the founder's calls.** Fix
  broken things and guideline violations; propose the rest.

## The review, in order

1. **Playwright CLI pass (reality first).** Drive the LIVE site
   (https://huberttheinventor.github.io). Screenshot every one of the thirteen
   pages at 390×844 and 1440×900. Capture console errors, failed network
   requests, dead links and anchors, missing assets, layout overflow, and
   tap-target sizes on mobile. Everything later must reconcile with what the
   browser actually shows.
2. **Web Design Guidelines audit.** Check every page's HTML/CSS against the
   guidelines: keyboard navigation, focus visibility, contrast, hit targets,
   input and zoom behaviour, motion respect (`prefers-reduced-motion` — this
   site is animation-heavy and has a CRT scanline layer), semantic structure.
3. **Taste Skill pass.** Judge the site as a designer: typography scale and
   rhythm, spacing consistency, hierarchy, where it reads generic or templated
   versus distinctive. The character (CRT/scanline, monospace, the HUBERT
   logotype stretched with `textLength`) is deliberate — critique execution,
   not the concept.
4. **Awesome Design pass.** Extract the site's de-facto design system (colours,
   type scale, spacing units, components) into `DESIGN.md`. Compare against the
   curated collection's quality bar. Flag every place the site contradicts its
   own system.

## Rules

- Every finding: file + line (or page + viewport + screenshot), severity
  (blocker / major / minor / nit), and the concrete fix.
- No invented numbers, no fabricated metrics, no "studies show" without a
  source. If a claim can't be checked, it doesn't go in.
- Verify each finding against the Playwright screenshots before reporting — a
  finding that contradicts the rendered reality is wrong.
- Deliverables: (a) `DESIGN-REVIEW.md` — findings ranked by severity, a
  per-tool section, and a one-page executive summary at top; (b) a
  `review/design-fixes` branch where you APPLY the blocker and major fixes that
  do not change the design's character — broken things, guideline violations,
  inconsistencies; (c) a list of the fixes you deliberately did NOT apply
  because they are design-direction calls. Those are mine.
- After applying fixes: bump the asset cache token, re-run the Playwright pass
  on the changed pages, and confirm nothing broke before presenting the branch.
- Commit with explicit paths only, never `git add -A`. Do not push, do not open
  a PR — show me the diff summary and wait.
