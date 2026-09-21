# Quantum guide deployment evidence

Prepared on 2026-09-21 in isolated worktree `feature/quantum-guide-publish`, based on the local `develop` branch at `f501979`.

## Published paths

- `/quantum/`
- `/quantum/quantum-schematic.svg`
- `/quantum/display.woff2`

## Source checks

- Local static HTTP checks returned `200` for all three paths.
- Local response content types were `text/html`, `image/svg+xml`, and `application/octet-stream` respectively.
- `quantum/index.html` SHA-256: `7A4BDC47031D381C649497491BFC68FDC38CF8ADCA4B04B07B675E0C6483F726`
- `quantum/quantum-schematic.svg` SHA-256: `C51FE71A52B2052F58BC0D39A7AE87FDE351A621900B7893A9E814645153D642`
- `quantum/display.woff2` SHA-256: `FFB8AACA090C283964310AC1B38565C3AADCEDBE133DF7A5DEC232AA0F0E9C6C`

## Analytics

The page uses the existing canonical GoatCounter endpoint `https://huberttheinventor.goatcounter.com/count` with the same async script standard used by the site. No new analytics account or event system was added.

## Release boundary

No Instagram post, native DM, keyword activation, or public URL claim is made until the GitHub push, merge, and public HTTP checks complete. Remote fetch from GitHub was unavailable in this session because Windows Git credentials failed (`SEC_E_NO_CREDENTIALS`); the worktree therefore started from the existing local `develop` branch and requires remote review before merge.
