# APK provenance locker review 6 — PASS

**Verdict: PASS.** There are **zero findings** of every severity and **zero
untested public claims**.

- Implementation reviewed: `614badd1471bf84e7bffec1f4dd042eb5eb63b08`
- Documentation/report revision: `4938f992a0d028643c1c2c41664889b5ab4b9bdf`
- Live build stamp: `05ab79387182a604c469f9b212ef0aeb7936992f`
- Live URL: <https://apk-provenance-locker.sociobot.in>
- Reviewed: 2026-09-05 UTC

`05ab793` and the later `4938f99` change factory evidence, reports, and the
handoff only. The live landing page uses the same `index-CLftqs4k.js` and
`style-BQGQnk5n.css` names produced from the reviewed implementation. The
candidate check confirms `614badd` is obtainable and retained by `main`.

## Job, audience, and first action

Fresh 1440 px desktop and 390 px phone contexts showed this before scrolling:

- Job: **Verify APKs before restoring**.
- Audience: Android users keeping APK files.
- First action: **Try it with sample data** — it says it will open two sample
  APK records.

Both contexts also showed the three plain facts: verification is on-device,
exports are password-encrypted, and there is no sign-in or account. The route
title is `APK Provenance Locker — Verify APK restore evidence`.

## Demo and core paths

One click opened `/?demo=1`, immediately showing the realistic F-Droid and
KeePassDX records. The persistent banner reads **Demo — sample data, nothing
is saved**. Reset demo was present and restored the two sample records. The
live release verifier additionally proved that Reset demo, Start for real,
Locker, and the wordmark erase demo storage while preserving real-storage
sentinels.

`npm run test:live` passed in fresh desktop and mobile contexts. It verified a
genuine signed APK, reported v1 + v2 + v3 signature evidence, then exercised
the named removal confirmation. It observed only same-origin bodyless GETs
and no console or page errors. The full suite covers invalid, malformed,
tampered, signer-drift, downgrade, password, restore, saved-copy, recovery,
and offline paths.

## Claims and clean checkout

From a newly cloned checkout, `npm ci` completed with zero vulnerabilities.
Every exact command in `.factory/claims.json` was invoked in manifest order:
all **26/26** passed. This includes the release-assets command, whose extra
Android release verifier passed.

The registry has 26 unique claim IDs. Each maps to exactly one tagged browser
test; the extra textual references to `@claim:release-assets` are its runner
and static-config assertions, not additional tests. The current copy audit
has no plain-words flags and maps the public behavioral statements to those
claims. No public claim was unlisted or untested.

Other clean-checkout gates passed:

- `npm test`: 24 unit tests and 41 browser tests passed.
- `npm run lint`, `npm run build`, and `npm audit --audit-level=high` passed.
  The build produced `dist/`; initial JavaScript is 12.11 KiB gzip and CSS is
  3.35 KiB gzip.
- `npm run test:candidate -- --expected-commit 614badd1471bf84e7bffec1f4dd042eb5eb63b08`
  passed; the candidate is obtainable and `main` is ahead of it.
- `npm run test:release` passed. The immutable v0.5.12 APK (5,589,035 bytes)
  and AAB (5,409,557 bytes), checksums, tag, source record, and embedded
  identity agree on source `058fe2ce981fead74ea63fd612da05baaadaecfe`.

The Android release intentionally predates the later static-site implementation
repair; the release-assets claim checks its complete, mutually consistent
immutable provenance rather than incorrectly relabelling it as the web repair.

## Live quality, privacy, and accessibility

Fresh Axe scans at 390 px had zero violations on `/`, `/demo`, `/privacy`,
`/terms`, and `/404.html`. Each has `lang=en`, one H1, one main landmark, a
route-specific title, complete image alternatives, no console/page errors,
and no horizontal overflow. `/opt/fleet/lib/verify-url.sh` passed the landing
and demo with the same title/lang/main/alt/console checks.

Keyboard testing found the visible Skip to content focus ring, the skip action
lands at the main heading, the Verify dialog focuses its file input, and Escape
closes it. Reduced-motion emulation has no animations and 0 s transitions.
The full browser suite also passes dialog focus restoration, touch targets,
and 200% reflow. A real unknown route returned the designed HTTP 404 with its
title, H1, main landmark, and return path. Chromium's failed-resource message
for that deliberate top-level 404 is expected, not a product error.

The live flow and privacy claim saw no APK upload, automatic third-party
request, analytics, account input, or request body. The service-worker offline
claims passed from their own browser contexts. This static local-first product
has no product backend, tenant database, or process to restart, so tenant
isolation, health, and restart persistence do not apply. Browser-local
persistence and demo isolation do apply and passed.

The live checkout endpoint returned HTTP 303 to the hosted checkout. For the
license verification allowance, requests 1–30 returned 200 and request 31
returned 429 with `Retry-After: 4`.

A fresh mobile Lighthouse run recorded 100 performance, 100 accessibility,
100 best practices, and 100 SEO; LCP was 1.16 s and CLS was 0.

## Earlier finding disposition

All earlier review and verification reports, including their minor findings,
were read. Their current disposition is below.

| Earlier reports and findings | Current proof and disposition |
| --- | --- |
| Review 1 F-1-1 through F-1-13 | 404 now has the designed route structure; the copy audit has no vague, jargon, term, word-count, slogan, or unlisted-art/release/Google-Play claim regression. |
| Review 2 F-2-1 through F-2-11 and the F-1-10 regression | Demo opens populated records immediately; terms and paid copy map to claims; restore import/download are implemented and tested; current first-screen and copy-audit checks pass. |
| Review 3 F-3-1 through F-3-2 | All demo exits are proven by `test:release` to erase demo storage and preserve real state; terminology is consistently audited as file fingerprint and signing history. |
| Review 4 F-4-1 through F-4-5 | The free-core entitlement has its own claim; README headings and demo/release wording are in the zero-flag copy audit. |
| Review 5 F-5-1 through F-5-5 and F-1-11 regression | Route focus/scroll regressions are in the browser suite; sizes and fallback claims no longer appear as unsupported visitor promises; the current first read and copy audit pass. |
| Verifications 2–7 | The prior missing/weak claims, missing cryptographic provenance, demo/404/PWA issues, and release defects are closed by the 26 exact claims, genuine signed-fixture flow, route scans, and full offline/accessibility suite. |
| Verifications 8–16 | Stale Android deliverables, Android backup, focus contrast, touch size, 200% dialog/404 reflow, and release provenance are closed by `test:release`, Android-backup/touch/reflow tests, fresh Axe scans, and no-overflow route checks. |
| Verification 17 | The absent/mutable candidate issue is closed: the reviewed implementation is obtainable and an ancestor of `main`, as the current candidate check proves. |
| Verification 18 | The previously intermittent checkout 503 is not present: the exact hosted-checkout claim, full suite, and fresh direct 303 probe pass. |
| Verification 19 | The release-assets ancestry check now correctly accepts an obtainable candidate retained by a later `main`; the exact claim command passed. |
| Verification 20 | The checkout 500 is absent and the fresh mobile performance score is 100, above the ≥90 gate. |
| Verification 21 | Reconfirmed independently by this fresh clone, live desktop/phone checks, 26 exact claims, current release/candidate checks, accessibility scans, and Lighthouse measurement. |

## Evidence

New screenshots, factory URL-verifier output, and the Lighthouse JSON are in
`.factory/review-6-evidence/`. The clean clone used for commands was
`/tmp/apk-locker-review-6.aaAvKY`.

## Findings

None. **Finding count: 0. Untested public-claim count: 0. Final verdict:
PASS.**
