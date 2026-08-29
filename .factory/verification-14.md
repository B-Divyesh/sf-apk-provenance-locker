# Independent product verification 14 — FAIL

**Result:** **FAIL — do not accept candidate `bdacf0785389a2ab16d94f8f4f26a78fa413417d`.**

**Verified URL:** <https://apk-provenance-locker.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Work order:** `apk-provenance-locker-verify-14`

No product source was changed. This report and the handoff update are the only intended repository changes.

## Release-blocking finding

### Critical — linked Android deliverables are not the candidate

The live web deployment exactly matches the candidate, but the Android APK and AAB linked from the live landing page do not.

`npm run test:release` failed with:

```
APK commit is 0809df82645dfecf73c1d9f592cc79728b2495e3; expected bdacf0785389a2ab16d94f8f4f26a78fa413417d
```

Independent release inspection confirmed both v0.5.5 artifacts contain `assets/public/build.json` with product `apk-provenance-locker`, version `0.5.5`, and old commit `0809df82645dfecf73c1d9f592cc79728b2495e3`:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `app-release.apk` | 5,588,369 | `fe55641767ae4b33244c93b5df4ae36989562bb23adefd304aefa69144b786d9` |
| `app-release.aab` | 5,408,878 | `d7f96119a0dbfbc42cd6961d4737d8495548a7faf8de1b18f2e49c919ed8a2e6` |

The published `SHA256SUMS` matches those files and the packaged-web demo-erasure test passes, so this is not corruption. It is a stale-binary provenance failure: users selecting **Download APK from GitHub** receive an older product than the verified live candidate. Rebuild/release the current commit (with a new version/tag if releases are immutable), update the landing links, and rerun `npm run test:release` until its identity assertion passes.

## Required opening gates

### Claims — PASS

`.factory/claims.json` exists and has **26** claims. After `npm ci` in this clean checkout, I invoked every exact declared command `npm test -- --grep @claim:<id>` against the demo entry point. The final Playwright record was `{"status":"passed","failedTests":[]}`. Every claim command passed:

| Claim | Result |
| --- | --- |
| `hash-check`, `signature-verification`, `v1-verification`, `tamper-rejection`, `lineage-integrity`, `apk-identity` | PASS |
| `downgrade-risk`, `signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`, `local-storage` | PASS |
| `android-backup-disabled`, `saved-copy-erasure`, `demo-sandbox`, `no-account-network`, `apk-never-uploaded` | PASS |
| `offline-reload`, `offline-verification`, `release-assets`, `paid-unlock`, `free-core-features`, `revoked-license` | PASS |
| `hosted-checkout`, `restore-import`, `saved-apk-download` | PASS |

The `release-assets` claim only proves deterministic links and does not prove that linked artifacts embed the candidate. The independent Android identity gate above therefore correctly fails despite that claim passing.

### Cold first read and one-click demo — PASS

In a new live browser context, the first screen had the h1 **“Verify APKs before restoring”**, identified **“Android users keeping APK files”**, stated what it checks before reinstall, and made **“Try it with sample data — Open two sample APK records.”** the clear first action. It therefore answers what the product does, for whom, and what to click first in plain words.

Keyboard activation of that link reached demo mode with two sample records and the persistent **“Demo — sample data, nothing is saved”** banner, Reset demo, and Start for real. The invalid-file recovery path rejected `broken.apk` with **“This file is too short to be an APK.”** and re-enabled submission.

## Clean checkout and functional verification — PASS except Android provenance

- `npm ci`: passed; 189 packages installed and npm audit reported 0 vulnerabilities.
- `npm run test:unit`: **18/18** passed.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and made `dist/`; initial JS is 42,970 bytes / **14.79 KiB gzip**, CSS 11,085 bytes / **3.29 KiB gzip**.
- `npm test`: passed; 18 unit/config tests and 39 browser tests selected; its final Playwright record has no failed tests.
- `npm run test:live`: passed at 1280px desktop and 390px mobile. In each, a genuine signed APK was verified and then its removal-confirmation path was exercised. Each observed five bodyless same-origin GETs and zero page or console errors.
- `node scripts/verify-android-release.mjs --skip-identity`: passed checksum, size, packaged web runtime, and demo-storage isolation checks for the old APK/AAB. Start for real, Locker, and wordmark each erased demo records, demo files, and demo license data while preserving real sentinels and reseeding two demo records.

The live site hashes match this candidate byte-for-byte:

| Asset | Live SHA-256 = local `dist/` SHA-256 |
| --- | --- |
| `index.html` | `731495b34113635d3f1b80736deb3353ce697ae42ce7e6212127ead9643153e9` |
| `assets/index-Dso87tPl.js` | `961b98b195069bddcf951e540cd6443a087468e881b01ef32df2798c4b950f28` |
| `assets/style-Dxosa8K4.css` | `87c6dc48cf874d0d3809bec330e39cc76c70c74381633c62690d0862913f3534` |
| `sw.js` | `0bd21787a4041ce433328fe106270591c0e527aa21460245c67b1bb7524b6544` |
| `manifest.webmanifest` | `5311b79a7d34feea23c467fa19801eda57c817c5f3a0983b184b8be60e286fb8` |

Thus the deployment-only issue is specifically the downloadable Android release, not the web deployment.

## Privacy, PWA, accessibility, performance, and headers — PASS

- In cold live landing and demo verification flows, request logging saw only same-origin GETs; no APK bytes, account input, analytics, GitHub API calls, console errors, or page errors. The explicit optional license-verification route is `https://api.sociobot.in` only after a license is supplied.
- `/` and `/demo` return 200; `/privacy`, `/terms`, manifest, robots and sitemap return 200; an unknown path returns 404. Each normal page has a route-specific title and exactly one h1. No `verify-url.sh` exists in this checkout, so title/lang/main/alt/error checks were independently performed in Playwright instead.
- Response headers include HSTS, `nosniff`, strict-origin referrer policy, denied camera/microphone/geolocation/payment permissions, and restrictive CSP including `frame-ancestors 'none'`. Hash-named JS/CSS and WASM are `max-age=31536000, immutable`; document and service-worker responses revalidate after 30 seconds.
- Live axe scans on `/demo` at desktop and 390px: **zero violations**, hence zero serious/critical findings. Both widths had `lang=en`, one main, one h1, no horizontal overflow, and a visible 3px focus outline. Keyboard Enter opened the Verify APK dialog; Escape closed it. In reduced-motion context, zero elements had a nonzero transition or animation.
- A live service-worker context had a controlling `sw.js`, cache `apk-locker-v15`, and no waiting worker after update check. With networking disabled, `/demo` reloaded 200 and rendered its two sample records. The worker uses versioned cache cleanup, `skipWaiting`, and `clients.claim`.
- Fresh mobile Lighthouse on live `/demo`: **99 performance, 100 accessibility, FCP 0.9 s, LCP 1.0 s, CLS 0, TBT 130 ms**.

## Server allowance and authentication — PASS

There is no sign-in or product backend. The optional Sociobot license-verify endpoint was independently tested with an invalid QA token from one client: requests 1–30 received HTTP 200 and request **31** received **429** with **`Retry-After: 4`**. Observed allowance: **30 verification requests per burst window**. The product does not use sign-in, so Entra tenant verification is not applicable.

## Defects and disposition

| Severity | Finding | Required disposition |
| --- | --- | --- |
| Critical / release-blocking | Live Download APK/AAB assets are v0.5.5 binaries from `0809df8…`, not candidate `bdacf078…`. | Rebuild and publish candidate artifacts, point the landing page at them, then rerun Android provenance verification. |
| High | None | — |
| Medium | None | — |
| Low | None | — |

**Final disposition: FAIL.**
