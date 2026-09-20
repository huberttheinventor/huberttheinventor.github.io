# Claudex guide — brand correction

Updated 2026-09-20 after the founder rejected the first local page as inconsistent with past artifacts. The earlier abstract visual pass did not establish brand fidelity and is superseded by reference-to-candidate comparison.

## Actual source artifacts

The current site manifest `_data/guides.json`, read 2026-09-20, identifies `weights.html`, `shadow.html` and `doorman.html` as the newest existing guide references. Their source and local rendered pages were inspected. `weights.html` supplies the actual page structure: maintained Hubert header, mobile navigation, CRT overlays, six-cell document grid, Paper/Panel control, native `journalArticle__article` typography, figure classes, ruled resource links, related-guide area and indigo footer.

The rejected standalone `.loop-*` layout and its bespoke global type styles are removed. The page now imports the same shared header and script partials through `build.mjs`; the companion path is included in that pipeline. Its status reads Preview and its identifier REVIEW, without inventing a released guide number.

The first illustration uses actual approved film frames: `claudex-loop-narrated-master.mp4`, SHA256 `b489f5ead740951866d76e08e881b1b5bf4a511fe33e9c7fd14c7680af0c3a1e`, at 4.5 s and 26.6 s. FFmpeg extracted the existing 1080×840 apparatus region at x=0/y=210 into `assets/lost-edit.png` and `assets/protected-edit.png`. No generated reinterpretation is used. The reader can compare the lost edit with the protected replay. The workflow diagram follows the website's existing desktop-map/mobile-rung pattern.

New scoped styling covers only the code surface and the proof comparison. Source code wraps on narrow screens while preserving its copy/download text. The example plan and fixture remain identical to their downloadable files.

## Verification

Measured locally 2026-09-20 at desktop 1440 px and mobile 390 px: Paper/Panel changes the reading state and pressed control; the illustration switch loads the matching image; the mobile menu opens; code has no hidden horizontal overflow; no JavaScript errors. Reduced-motion and settled normal-motion captures were produced for independent visual comparison. The downloads and fixture assertions also pass.

Shared chrome can be checked without rewriting unrelated historical pages:

```sh
node build.mjs --check --page claudex-loop/index.html
node claudex-loop/fixture.mjs
```

The pre-commit hook now restages generated HTML only when that exact file was already staged, including the archive. This preserves explicit-path staging and prevents a companion-page edit from sweeping unrelated archive changes into its commit. Existing global checks still run in the hook.

No publication or live delivery change is included.
