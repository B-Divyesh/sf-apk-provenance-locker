# Independent verification 4 — FAIL

**Candidate:** `28f496e16eb70915da8661fa45f5ca1dda99c868`  
**Live URL:** https://apk-provenance-locker.sociobot.in  
**Verified:** 2026-08-29 (UTC)  
**Decision:** **FAIL — release-blocking claims-contract defect.**

## First read, cold live page

It is an on-device APK verifier and evidence locker for Android sideloaders preparing to reinstall an APK. The first action is plainly the one-click **Try it with sample data** link, which says it will show a ready-to-check locker. The first screen explicitly names both the audience and task. This gate passes.

## Release-blocking defect

### P1 — “Your APK files are never uploaded” is an unlisted privacy claim

The landing image caption at `src/main.ts` says: **“Your APK files are never uploaded.”** The live page contains the same sentence. This is a concrete, user-reliant privacy promise, but `.factory/claims.json` has no corresponding claim/test. Its closest entry, `no-account-network`, asserts only that the demo has no account and no *automatic third-party* requests; its sandbox does not select an APK and does not establish that a selected APK can never be sent to the product origin or any other origin.

The factory claims contract requires every such statement to have a listed, observable test, and says an unlisted claim fails review until it is removed or a test is added. This is therefore a release blocker even though the observed implementation made only same-origin static requests and the normal file flow worked locally.

Required repair: either remove/qualify this sentence, or add a dedicated privacy claim whose demo-entry-point Playwright test selects and processes a fixture while recording all requests, asserting no request carries APK bytes and no non-product origin is contacted. Re-run the exact claim command after repair.

## Claims gate — PASS (but does not cure P1)

`.factory/claims.json` exists and lists 18 claims. From the clean checkout I ran every listed exact `npm test -- --grep @claim:<id>` command through the product's Playwright demo entry point. All passed. A subsequent complete `npm test` also passed all 12 unit/static tests and all 23 browser tests.

| Claim IDs passed |
| --- |
| `hash-check`, `signature-verification`, `v1-verification`, `tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`, `signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`, `local-storage`, `saved-copy-erasure`, `demo-sandbox`, `no-account-network`, `offline-reload`, `offline-verification`, `release-assets` |

## Build and functional evidence

- `npm ci` succeeded with no reported vulnerabilities.
- `npm test`: **35 tests passed** (12 unit/static + 23 browser).
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and produced `dist/`; bundle sizes were JS 32.74 kB raw / 12.22 kB gzip and CSS 9.64 kB raw / 2.98 kB gzip.
- Independent production-preview flow: malformed `broken.apk` reported “This file is too short to be an APK.” and stayed recoverable. The real signed `v1v2v3-lineage.apk` then verified as `android.appsecurity.cts.tinyapp` version `1.0` / code `10`, SHA-256 `9c6947bf…19bdaa15`, v1+v2+v3, and a three-certificate lineage. A saved-copy encrypted export downloaded (31,934 bytes); a mismatched confirmation gave the expected error and recovery with the matching password produced a kit whose validation reported “1 APKs match”. Removing the record returned the empty state.
- `/demo` showed the persistent “Demo — sample data, nothing is saved” banner and two sample records. `Start for real` removed the `demo:apk-locker:records` key and opened the empty real namespace.
- PWA: active service worker scope was `/`, state `activated`; after first visit, `/demo` reloaded offline with its heading and two sample records. Its update path was inspected and `registration.update()` completed; the worker uses `skipWaiting` and `clientsClaim`.
- Reduced-motion emulation found no active CSS animations or transitions.

## Live deployment, privacy, accessibility, and performance

- Candidate match: SHA-256s of live `/`, `/assets/index-CTSmEZV-.js`, and `/assets/style-kkPqLax9.css` exactly matched this candidate's `dist/` files: `9d05af…cbaaa9`, `207feb…17ab8b`, and `d2d9e1…acbb367` respectively.
- Fresh desktop and 390×844 mobile visits had title, one h1, main landmark, descriptive image alt, and the required first-screen demo action. The keyboard order started at the skip link and included all nav/actions. The visible focus ring was a 3 px `rgb(255, 154, 111)` outline. No traps found.
- Playwright request logs recorded only the product origin on initial and demo flows (four static requests), with no page errors or console errors. No account controls were present. This supports, but does not fully test, P1.
- Axe (WCAG A/AA) on live desktop and 390 px mobile: **0 serious/critical**.
- Live mobile Lighthouse: **Performance 95, Accessibility 100, Best Practices 100, SEO 100**; FCP 1.00 s, LCP 1.45 s, CLS 0, transfer weight 93,531 B.
- Live headers: CSP limits `connect-src` to `'self'`, `frame-ancestors 'none'`, HSTS, `nosniff`, strict referrer policy, and restrictive permissions policy were present. Hashed JS/CSS and the verifier WASM were immutable for one year; HTML used 30-second revalidation. `/demo` and `/privacy` returned 200; an unknown route returned the designed 404.
- There are no product server-side/API endpoints, sign-in flows, or payment calls, so rate-limit and Entra checks are not applicable.

## Android release artifact

The v0.3.0 landing links resolved. The APK (5,583,235 B) and AAB (5,403,880 B) match published `SHA256SUMS` exactly:

- APK: `cdaf8cbc1e6cdf0921fb53e959e4900c0e29c9d768165daa759385ba56f5bbe3`
- AAB: `f6941bfa20c5f2bfa9eead06c680d37b91fe0a45b561cbe89e45afb21a7198af`

The APK is a valid ZIP carrying `AndroidManifest.xml`, signing files, packaged web assets, and Capacitor configuration with app id `in.sociobot.apk_provenance_locker`. Source configuration declares version `0.3.0`, code `3`; the downloaded asset contains the matching app id string.

`android/gradlew test` could not start in this verifier image because neither `JAVA_HOME` nor `java` exists. `go test ./...` in `tools/apksig-wasm` likewise could not start because `go` is absent. These are environment limitations, not observed source-test failures; the released Android artifact was independently downloaded, checksum-validated, and inspected instead.

## Next step

Add the missing end-to-end no-upload claim/test (or remove the promise), then rerun the claims gate and independent verification. No other release-blocking defect was found.
