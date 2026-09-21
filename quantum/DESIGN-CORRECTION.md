# Quantum guide — canonical design correction

Founder reference, 21 September 2026: https://huberttheinventor.github.io/shadow.html . Secondary reference: eigen.html. Maintained source: _partials/, assets/css/99-hubert.css and DESIGN.md.

The previous Quantum guide accidentally reinstated retired System B: Archivo/Newsreader/JetBrains Mono, cream paper, independent sticky rail and split-column colour blocks. The publisher README explicitly says the upstream site/ directory and tokens.css design are superseded. A Hubert wordmark alone did not make that a canonical page.

## Correction plan

- Use the actual shared header, assets, scripts and reading toggle, stamped by build.mjs. No look-alike chrome.
- Use the existing journal article: document metadata, one reading plate, large narrative headings, dark diagram field, hairline links and blue footer. Keep Shadow's desktop/mobile typography and breakpoints.
- Shared palette: canvas #1a1a1a, paper #d5d6db, panel #22242b, footer #03049c. Diagram field #04111f, linework #79b0cc, labels #abbac2, notes #faf6af.
- SemiSqueezed headings/wordmark, Graphik prose, Mono apparatus. No Google Fonts, cream-paper layer, grain substitute, card grid or new global type system.
- Preserve the explanation, fixed-axis scientific limits, interactive probabilities, downloadable schematic, primary sources, analytics and /quantum/?g=quantum URL. The locked film, narration, master and DM worker are untouched.
- No invented guide number: its field-guide value remains QUANTUM until an episode number is assigned.

Only the two-row diagram, accessible probability control and equation labels require topic-specific layout. They inherit the canonical page; they do not define another design system.

## Scope

Register the nested companion in build.mjs and use `node build.mjs --page quantum/index.html`. Full-site --check already reported unrelated stale generated pages on the starting commit; do not publish their regeneration in this correction. Targeted build and reference-style checks are the relevant gates.

## Verified correction

21 September 2026, Chromium checks recorded in `design-verification.json` at 19:41:46 UTC:

- At 320, 390 and 1440 CSS pixels, Quantum's heading, lead, prose, metadata, reading plate, header and footer match Shadow's computed styles exactly. Canonical local fonts load; no horizontal overflow or JavaScript exceptions.
- The probability presets and slider work; all 20 illustrative records remain on the two permitted levels. Paper/Panel switches and survives reload. The mobile menu and every local link work.
- Without JavaScript, the article, static map and download remain visible. The inherited article reveal started at zero opacity; a Quantum-scoped noscript override fixes that without changing the shared site. The test checks visibility through every ancestor, not only the heading's own opacity.
- Independent visual review of the actual captures approved the canonical shell, mobile diagram and equation, plus the corrected no-JavaScript view. Captures stay in ignored `.qa/` and are not web content.
- The downloadable SVG uses the same local SemiSqueezed, Graphik and PP Neue Montreal Mono fonts, embedded for offline use, and the canonical diagram palette. It was inspected at 1200 px; no clipping found. `build-schematic.mjs` produces the same bytes on repeated runs.

Schematic SHA-256: `63090ccf01ec53c07aa08847f64ff3e0e0b57d57916921d6c9b7d36e924d66e7`.

## Ownership and release boundary

The maintained website source is this publisher repository. Do not overwrite this page from the retired account repository's `site/quantum/` copy. The already-delivered video ZIP is a historical, fingerprinted artifact and has not been changed; its old schematic is superseded by the live guide's download. The video master, audio, cover and QUANTUM automation are outside this correction and remain unchanged.

Run the page build check and `node quantum/check-design.mjs` before future Quantum page releases. The browser check compares the current shared reference, rather than a duplicated approximation of the design system. Its local Puppeteer and Chrome paths currently target the founder's Windows workstation.
