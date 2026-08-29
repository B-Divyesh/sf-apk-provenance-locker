# Polish round 1 — finding closure

Base reviewed: `45d2ac0d4d7ccfe4f10b7fdaee4a61e5ccf81560`.
Repair: `584112896d436a144f957321be625da4e0c7deda`.
Live URL: https://apk-provenance-locker.sociobot.in.

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files existed.
The verification reports that predate review 1 were also reread and their
previous fixes re-exercised by the claim and live suites recorded below.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added 404 description, canonical, favicon, theme, OG, and Twitter metadata. | `static 404 has complete route metadata…`; live `/not-a-real-route` HTTP 404 check; `.factory/evidence/404-mobile.png` |
| F-1-2 | Added Demo, Locker, Privacy header navigation and Privacy/Terms footer links to the standalone 404. | Same static-404 browser test; live 404 navigation check; `.factory/evidence/404-mobile.png` |
| F-1-3 | Changed the landing eyebrow to “Local APK verification”. | `keeps reviewed visitor copy…`; live copy recheck; `.factory/evidence/live/screenshot-mobile.png` |
| F-1-4 | Changed the locker eyebrow to “Your verified APK records”. | Copy regression test and live copy recheck. |
| F-1-5 | Changed step two to “Read the package and version.” | Copy regression test and live copy recheck. |
| F-1-6 | Changed step three to “Check signer and downgrade risks.” | Copy regression test and live copy recheck. |
| F-1-7 | Changed the footer to “Records and saved APK copies stay on this device.” | Copy regression test; `@claim:local-storage`; live footer check. |
| F-1-8 | Removed the visitor-facing generated-art provenance sentence; provenance remains in `.factory/design.md`. | Copy regression test and live forbidden-phrase check. |
| F-1-9 | Removed the release-specific-key statement from landing, README, and release notes. | Copy regression test and live forbidden-phrase check. |
| F-1-10 | Removed the Google Play statement from landing and README. | Copy regression test and live forbidden-phrase check. |
| F-1-11 | Split the 23-word README workflow sentence into two short sentences. | `.factory/copy-audit.md`; README audit result Pass. |
| F-1-12 | Replaced certificate-rotation jargon with the signing-key-change explanation. | `.factory/copy-audit.md`; README audit result Pass. |
| F-1-13 | Rewrote restore-kit encryption copy around the user outcome, retaining algorithm names in parentheses. | `.factory/copy-audit.md`; README audit result Pass. |

## Cumulative verification

From a clean clone, all 19 exact claim commands in `.factory/claims.json`
passed individually. `npm test` passed 14 unit/config and 25 browser tests;
`npm run lint`, `npm run build`, and `npx cap sync android` also passed.

After Azure Static Web Apps deployment `7611c7cb-d444-4ab7-bf15-79e8fd0703e9`,
the cold landing check, desktop/mobile real-APK demo checks, privacy request
check, offline claim coverage, route checks, mobile layout, and axe scans all
passed. Screenshots and the cold-load report are retained under
`.factory/evidence/`.
