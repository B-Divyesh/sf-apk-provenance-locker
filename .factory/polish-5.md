# Polish round 5 — complete finding closure

Released source: `ab3eb699bcd49051f663dc3d5a077299313e83a3` (`v0.5.10`).
Live URL: `https://apk-provenance-locker.sociobot.in`.

Final live evidence is in `.factory/evidence/polish-5/live/`: `root/verify.json`,
`demo/verify.json`, `demo-one-click-mobile.png`, `routes/404-mobile.png`,
`final-audit.json`, and `lighthouse-mobile.json`. The final audit recorded zero
unexpected console/page errors, no serious or critical Axe findings, a first
demo record at y=638.39 in a 390×844 viewport, and exact scroll restoration
(3221 → 0 → 3221) with heading focus.

## Review 1 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the standalone 404 route metadata: title, description, canonical, favicon, theme, OG, and Twitter data. | Test `static 404 has complete route metadata and shared recovery navigation`; `routes/404-mobile.png`; live `/not-a-real-route` is HTTP 404 in `final-audit.json`. |
| F-1-2 | Kept the shared wordmark, Demo/Locker/Privacy header, and Privacy/Terms footer on 404. | Same static-404 test; `routes/404-mobile.png`; live `/not-a-real-route`. |
| F-1-3 | Kept the concrete landing eyebrow “Local APK verification.” | Test `keeps reviewed visitor copy concrete, plain, and within the sentence limit`; `root/screenshot-mobile.png`; live `/`. |
| F-1-4 | Kept “Your verified APK records.” | Same copy test; `demo-one-click-mobile.png`; live `/?demo=1`. |
| F-1-5 | Kept “Read the package and version.” | Same copy test; `root/screenshot-desktop.png`; live `/`. |
| F-1-6 | Kept “Check signer and downgrade risks.” | Same copy test and `@claim:free-core-features`; live `/`. |
| F-1-7 | Kept the storage-specific footer sentence. | `@claim:local-storage`; `routes/404-mobile.png`; all final-audit routes. |
| F-1-8 | Removed generated-art provenance from visitor copy; it remains only in design provenance. | Copy regression test; `root/screenshot-mobile.png`; live `/` text check. |
| F-1-9 | Removed the release-test-key assertion from visitor copy and README. | Copy regression test; `npm run test:release`; live `/`. |
| F-1-10 | Removed Google Play assertions, including the later regression. | `@claim:release-assets` and copy regression test; live `/` text check. |
| F-1-11 | Rewrote the release workflow instructions as short, single-idea sentences again after the round-5 regression. | Copy regression test; `.factory/copy-audit.md`; clean-clone README check. |
| F-1-12 | Kept the signing-key-change explanation instead of certificate-rotation jargon. | `@claim:signer-drift`; `.factory/copy-audit.md`; final README. |
| F-1-13 | Keeps the password-encryption outcome before algorithm names. | `@claim:encrypted-export`; `.factory/copy-audit.md`; final README. |

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | The one-click `/?demo=1` page renders seeded records before marketing sections. | Test `opens sample records above the fold from the first-screen demo action`; `demo-one-click-mobile.png`; live `/?demo=1` record y=638.39. |
| F-2-2 | Terms retains only the tested Sociobot hosted-checkout wording. | `@claim:hosted-checkout`; final-audit live `/terms`; copy audit. |
| F-2-3 | Restore validation supports conflict-aware record import and verified saved-APK download. | `@claim:restore-import`, `@claim:saved-apk-download`, and conflict-choice browser test; live `/demo` flow in `npm run test:live`. |
| F-2-4 | The first-screen action explains “Open two sample APK records.” | Copy regression test; `root/screenshot-mobile.png`; live `/`. |
| F-2-5 | The audience sentence now names Android users, apps, versions, signing history, and file fingerprints. | `.factory/copy-audit.md`; `root/screenshot-mobile.png`; live `/`. |
| F-2-6 | The license action is “Restore Locker Plus license.” | `@claim:paid-unlock`; live `/?demo=1`. |
| F-2-7 | The product page states the Android-signature-rules outcome; adapter details stay in developer documentation. | Copy regression test; `@claim:signature-verification`; live `/`. |
| F-2-8 | README uses “restore kit” consistently. | `.factory/copy-audit.md`; `@claim:encrypted-export`; final README. |
| F-2-9 | README heading is “Use APK Provenance Locker.” | Copy regression test; final README. |
| F-2-10 | User-facing copy consistently uses “signing history.” | `@claim:signature-verification`, `@claim:signer-drift`; `.factory/copy-audit.md`; live `/`. |
| F-2-11 | Removed upload-key and Google Play maintainer jargon from download copy. | Copy regression test; final README; live `/`. |

## Review 3 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | All three exits—Start for real, Locker, and wordmark—run `leaveDemo()` and erase demo records, IndexedDB files, and demo license keys without touching real storage. | `@claim:demo-sandbox`; published `npm run test:release` demo-erasure report; live `/demo`, `/`, and `/#locker` checks. |
| F-3-2 | Introduced “SHA-256 file fingerprint” once and use “file fingerprint” thereafter; `SHA256SUMS` is only the filename. | `@claim:hash-check`; copy regression test; `.factory/copy-audit.md`; live `/`. |

## Review 4 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-4-1 | Declared and tests the complete free entitlement: verification, signer/downgrade warnings, restore-kit export, and reopening. | `@claim:free-core-features`; live `/demo` flow in `npm run test:live`. |
| F-4-2 | README heading is “Develop and verify APK Provenance Locker.” | Copy regression test; `.factory/copy-audit.md`; final README. |
| F-4-3 | README heading is “Deploy APK Provenance Locker.” | Copy regression test; `.factory/copy-audit.md`; final README. |
| F-4-4 | Explains demo isolation in plain words instead of storage-namespace jargon. | `@claim:demo-sandbox`; `.factory/copy-audit.md`; live `/?demo=1`. |
| F-4-5 | README explains the repository-commit check and the three named demo exits. | Copy regression test; `npm run test:release`; final README. |

## Review 5 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-5-1 | Stores outgoing scroll in history state, resets client routes to the top, restores exact Back position, focuses the new H1, and announces route changes. | Test `moves client routes to their heading and restores the exact Back scroll position`; live `final-audit.json` records 3221 → 0 → 3221 and H1 focus at `/privacy` then Back. |
| F-5-2 | Removed package-size text from the landing page; the release status shows only tag and source commit. | `@claim:release-assets`; copy regression test; live `/` in `root/verify.json`. |
| F-5-3 | Removed the automatic GitHub release-metadata lookup and fallback promise. Source-bound versioned links render directly, so there is no rate-limit console failure or automatic third-party request. | `@claim:no-account-network`, `@claim:release-assets`, `npm run test:live`; final live demo origins are same-origin only in `final-audit.json`. |
| F-5-4 | Replaced “identity” and compiled-manifest wording with package name and version language. | Copy regression test; `@claim:apk-identity`; live `/` and `/?demo=1`. |
| F-5-5 | Renamed the mapping file “source record” and explains SHA256SUMS plus the repository commit before naming `RELEASE_PROVENANCE.json`. | `@claim:release-assets`; copy regression test; live `/`. |

Every current claim entry was run independently from a clean clone, then again
as part of the full suite. There are no remaining review findings of any
severity.
