# Independent product verification 21 — PASS

**Verdict: PASS.** There are **zero findings** and **zero untested public claims** for the reviewed implementation.

- Implementation reviewed: `614badd1471bf84e7bffec1f4dd042eb5eb63b08`
- Documentation/report revision: `05ab79387182a604c469f9b212ef0aeb7936992f`
- Live URL: <https://apk-provenance-locker.sociobot.in>
- Verified: 2026-09-05 UTC

`05ab793` changes factory documentation and evidence only. Its diff from the implementation contains no runtime source, static asset, configuration, or Android-artifact change. Live `/build.json` names that later documentation revision; the browser runtime asset names match the production build from the reviewed implementation. `npm run test:candidate -- --expected-commit 614badd1471bf84e7bffec1f4dd042eb5eb63b08` confirmed that the implementation is obtainable and an ancestor of `main`.

## Job, audience, and first action

Fresh desktop (1440 × 900) and phone (390 × 844) browser contexts showed, before scrolling:

- Job: **“Verify APKs before restoring.”**
- Audience: Android users keeping APK files.
- First action: **“Try it with sample data”**, with “Open two sample APK records.”

The job, audience, primary action, and three plain facts are visible on the first screen at both sizes. The title is `APK Provenance Locker — Verify APK restore evidence`.

## Demo and product paths

One click opens `/?demo=1`, immediately showing realistic F-Droid and KeePassDX sample records. The persistent banner says “Demo — sample data, nothing is saved” and provides Reset demo and Start for real. Reset reseeded two records in `demo:apk-locker:records`; real storage remained unchanged. Start for real cleared demo storage and returned to the real locker. The release check also proved the three supported exits (Start for real, Locker, wordmark) erase demo data while preserving real storage.

A live signed-fixture check produced `android.appsecurity.cts.tinyapp` 1.0/code 10 with v1, v2, and v3 evidence. A three-byte `.apk` returns “This file is too short to be an APK.” Removal requires its named confirmation. The full suite covered tampering, malformed archives and lineage, signer drift, downgrade warning, encrypted export, restore import, saved-copy download, password non-storage, license states, and persistence.

## Claims and clean checkout

After `npm ci`, every exact command in `.factory/claims.json` ran in manifest order. All **26/26** passed:

`hash-check`, `signature-verification`, `v1-verification`, `tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`, `signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`, `local-storage`, `android-backup-disabled`, `saved-copy-erasure`, `demo-sandbox`, `no-account-network`, `apk-never-uploaded`, `offline-reload`, `offline-verification`, `release-assets`, `paid-unlock`, `free-core-features`, `revoked-license`, `hosted-checkout`, `restore-import`, and `saved-apk-download`.

The registry has 26 unique IDs and each has exactly one matching `@claim:<id>` tag. The current copy audit has no word-count or banned-word flag and maps visitor promises to registered claims.

Passed repository gates:

- `npm run lint`
- `npm run build` — produced `dist/`; 12.11 KB gzip entry JS and 3.35 KB gzip CSS
- `npm test` — 24 unit and 41 browser tests passed
- `npm run test:live` — desktop and phone verification/removal; same-origin bodyless GETs; zero console errors
- `npm run test:candidate -- --expected-commit 614badd...`
- `npm run test:release`

The immutable Android v0.5.12 APK (5,589,035 bytes) and AAB (5,409,557 bytes) match their checksums and embedded source identity `058fe2ce981fead74ea63fd612da05baaadaecfe`. That is the release source; the later reviewed web repair is a separate static-site implementation revision.

## Live accessibility, privacy, routing, and offline behavior

Fresh desktop and phone Axe scans found zero violations on `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`. Every route has `lang=en`, one H1, one main landmark, a route-specific title, no horizontal overflow, and zero console/page errors. The requested `verify-url.sh` was not present in the clean checkout or worker PATH, so equivalent title/lang/main/alt/console checks were performed in the same fresh Playwright contexts with Axe.

Keyboard checks confirmed skip link, visible focus, dialog focus, Escape close, and focus restoration. Reduced motion had no active transitions or animations. The full browser suite checks 200% text reflow for legal pages, dialogs, and the designed 404. A deliberate unknown URL returns designed HTTP 404; this is expected behavior, not a defect.

The service worker controlled `/demo`, had no waiting update, and offline reload rendered the banner and two records. Recording landing, demo, signing, and removal found no APK upload, account input, analytics, third-party automatic request, console error, or page error. All public internal, checkout, APK, AAB, checksum, source-record, and legal links resolve. Security headers include HSTS, nosniff, strict referrer policy, restrictive Permissions Policy, and matching CSP.

The former route-history issue is closed: on mobile, Privacy focuses its visible H1 and Back restores the exact landing scroll position; the production smooth-scroll settles at zero on the new route before the regression poll.

## Checkout, allowance, and performance

Three consecutive checkout probes returned HTTP 303 to Dodo. The exact checkout claim and the complete browser suite passed. No payment was made, so post-purchase entitlement is not claimed as proven.

Invalid-license requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 4`. There is no account or tenant backend, so tenant isolation and restart persistence are not applicable.

Three fresh mobile Lighthouse performance runs scored **98, 93, and 100** (all ≥90) with CLS 0. LCP measurements were 1.86 s, 2.57 s, and 1.51 s; normal network-run variation did not drop the score below the quality gate.

## Earlier finding disposition

| Earlier finding groups | Current disposition and proof |
| --- | --- |
| Review 1–5: 404, plain words, terminology, copy length, unlisted copy, demo first-use, restore import/download, navigation history | Closed by current copy audit, live 404/route scans, demo flow, claim tests, and history regression. |
| Verification 1–4: missing provenance capability and unregistered privacy claims | Closed by the 26 claim tests for signing, identity, hash, local-only handling, and no-upload requests. |
| Verification 6–12, 14, 16: stale artifacts, backup, touch/focus, reflow, mobile 404 | Closed by `test:release`, Android-backup and 200%-reflow tests, and live Axe scans. |
| Verification 17 and 19: absent candidate / mutable-branch equality | Closed by the candidate ancestor check and immutable tagged release source record. |
| Verification 18 and 20: checkout outage | Closed by exact claim, full suite, and three direct Dodo redirects. |
| Verification 20: mobile performance 87 | Closed: this verification measured 98, 93, and 100, all ≥90. |

## Findings

None. **Finding count: 0. Untested public-claim count: 0. Final verdict: PASS.**

