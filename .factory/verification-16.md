# Independent product verification 16 — FAIL

**Result:** **FAIL — reject candidate `20f18f0c906cab75a91250e494168f915375fd1f`.**

**Verified URL:** <https://apk-provenance-locker.sociobot.in>

**Verified:** 2026-08-30 UTC

**Work order:** `apk-provenance-locker-verify-16`

No product source was changed. This report, the verifier handoff, and QA
evidence are the only intended repository changes.

## Acceptance decision

The web product performs the brief's useful job. It verifies a real APK's
signature, package identity, version, signing history, and SHA-256 fingerprint;
detects signer and downgrade risk; stores an optional local copy; exports an
encrypted restore kit; and validates/imports it later. The opening screen and
one-click demo pass. The candidate nevertheless fails release acceptance for
two reasons:

1. **Critical — the downloadable Android release is not bound to the candidate.**
   The live page says `v0.5.10 matches source 20f18f0c906c`, but the v0.5.10
   tag, release notes, `RELEASE_PROVENANCE.json`, APK, and AAB all identify
   `ab3eb699bcd49051f663dc3d5a077299313e83a3`. The product's central provenance
   statement is false for this candidate.
2. **Medium — the real 404 page does not reflow at 200% text on a 390px
   viewport.** It creates 99px of horizontal overflow. The non-wrapping
   wordmark has a 335px client width but 462px scroll width.

## Required opening gates

### Claims — installed clean-clone run PASS; published release claim false

`.factory/claims.json` exists with 26 unique IDs, 26 unique commands, and
exactly one matching `@claim:<id>` test tag per claim. Before installing
dependencies, all exact commands correctly could not start because
`@playwright/test` was absent. After the required `npm ci`, I ran all 26 exact
commands independently. Every command passed one tagged test:

- APK evidence: `hash-check`, `signature-verification`, `v1-verification`,
  `tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`,
  `signer-drift`, and `apk-structure`.
- Storage and restore: `encrypted-export`, `password-not-stored`,
  `local-storage`, `android-backup-disabled`, `saved-copy-erasure`,
  `demo-sandbox`, `restore-import`, and `saved-apk-download`.
- Network, offline, release, and paid tier: `no-account-network`,
  `apk-never-uploaded`, `offline-reload`, `offline-verification`,
  `release-assets`, `paid-unlock`, `free-core-features`, `revoked-license`, and
  `hosted-checkout`.

The passing `release-assets` claim test is a false positive against the live
promise. It checks that the page renders versioned URLs and current build text,
but does not prove that the files at those URLs came from the displayed commit.
The repository's stronger published-release check fails:

```text
npm run test:release -- --expected-commit 20f18f0c906cab75a91250e494168f915375fd1f
Error: Release notes do not bind the immutable source commit
```

Running the same check with the older commit `ab3eb699...` passes and proves
that all four published assets belong to that older source. This violates the
`release-assets` claim even though its tagged sandbox test passes.

### Cold first read and one-click demo — PASS

The fresh desktop and mobile first screen answers all three questions in plain
words:

- What: **“Verify APKs before restoring.”**
- For whom: **“For Android users keeping APK files…”**
- First click: **“Try it with sample data”**, beside **“Open two sample APK
  records.”**

One click opens `/?demo=1`, shows two realistic records above the mobile fold,
and keeps the persistent **“Demo — sample data, nothing is saved”** banner with
**Reset demo** and **Start for real** visible.

Evidence: `verification-evidence-16/demo-one-click-mobile.png` and
`verification-evidence-16/live-audit.json`.

## Clean checkout and build gates — PASS

- Candidate HEAD before QA: `20f18f0c906cab75a91250e494168f915375fd1f`.
- `npm ci`: passed; 189 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=high`: passed; 0 vulnerabilities.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm test`: passed, 22 unit/config tests and 40 browser tests.
- `npm run build`: passed and produced `dist/`.
- `npx cap sync android` in a disposable copy: passed without tracked source
  changes.
- Production JS: 44,565 bytes / 15.40 KB gzip.
- Production CSS: 11,221 bytes / 3.35 KB gzip.
- Hero WebP: 75,842 bytes. These are below the stated budgets.

## End-to-end behavior and boundaries — PASS

An independent live mobile flow used the genuine v1/v2/v3 lineage fixture and
confirmed:

- package `android.appsecurity.cts.tinyapp`, version `1.0`, code `10`;
- SHA-256
  `9c6947bf9398a15e85a52bf83b07cfae6686ff49e03034d09cbea45a19bdaa15`;
- verified v1, v2, and v3 schemes plus signing history;
- non-ZIP recovery: **“This file is too short to be an APK.”**;
- invalid URL recovery: **“Please enter a URL.”**;
- the 11-character password boundary and successful 12+-character recovery;
- mismatched-password and wrong-restore-password recovery;
- encrypted download, validation, and availability of verified-copy download
  and import actions;
- a 20-saved-APK restoration boundary returning **“20 APKs match.”**

The full suite additionally covers tampering, malformed signing lineage,
v1-only signing, signer drift, downgrade warnings, 12 MiB exports, import
conflicts, removal cancellation/confirmation, and byte-identical saved-copy
download.

Evidence: `verification-evidence-16/live-flow.json`.

## Live deployment parity — web PASS, Android FAIL

The live web deployment does match the candidate build. Local and live copies
of `index.html`, hashed JS/CSS, `sw.js`, `manifest.webmanifest`, `build.json`,
hero art, icons, and the apksig JavaScript/WASM runtime were byte-for-byte
identical. Both build files say:

```json
{"product":"apk-provenance-locker","version":"0.5.10","commit":"20f18f0c906cab75a91250e494168f915375fd1f"}
```

The Android downloads do not match that identity:

| Evidence | Published value |
| --- | --- |
| `v0.5.10` tag target | `ab3eb699bcd49051f663dc3d5a077299313e83a3` |
| Release notes source | `ab3eb699bcd49051f663dc3d5a077299313e83a3` |
| Provenance source | `ab3eb699bcd49051f663dc3d5a077299313e83a3` |
| APK embedded `build.json` | `ab3eb699bcd49051f663dc3d5a077299313e83a3` |
| AAB embedded `build.json` | `ab3eb699bcd49051f663dc3d5a077299313e83a3` |

The stale packages are internally intact but are not candidate artifacts:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| APK | 5,589,014 | `31fcaf37e75fee233cf18bd85dc32486e27150a1ea463d460fce93a0cde28e4b` |
| AAB | 5,409,555 | `5f7a45fe029e262cd03ecf029b956c94635b3bb2137590a485ce45c6a701fcf4` |

Both archives pass ZIP integrity and `SHA256SUMS`. Independent binary-manifest
inspection confirms package `in.sociobot.apk_provenance_locker`, version name
`0.5.10`, version code `15`, main activity
`in.sociobot.apk_provenance_locker.MainActivity`, and `allowBackup=false`.
The packaged app requests Internet plus its library-generated private dynamic
receiver permission; it requests no storage, camera, microphone, or location
permission. All four public download links resolve successfully.

## Privacy, headers, caching, and allowance — PASS

- The complete live APK verification and restore flow recorded 10 requests,
  all bodyless GETs to the product origin. No APK bytes, records, passwords,
  analytics, advertising, or account data left the browser. There were zero
  application console or page errors.
- Optional purchase navigation reaches the Sociobot checkout and then Dodo's
  hosted checkout. License verification is the only product API call.
- The live license-verification endpoint allowed 30 requests from one client;
  request 31 returned HTTP 429 with `Retry-After: 4`.
- HTML and `sw.js` use `public, must-revalidate, max-age=30`; the manifest uses
  one-day caching; hashed JS/CSS and apksig assets use one-year immutable
  caching.
- Responses include HSTS, `nosniff`, strict-origin referrer policy, restrictive
  camera/microphone/geolocation/payment policy, and a matching CSP with
  `frame-ancestors 'none'`.
- There is no product backend or sign-in, so health/concurrency/persistence and
  Entra authority checks are not applicable.

## Accessibility, responsive behavior, and PWA — one medium defect

- The factory URL verifier passed `/` and `/demo`: correct title, `lang=en`,
  one H1, one main, complete image alt text, labeled buttons, and no errors.
- Axe found zero serious or critical findings on `/`, `/demo`, `/privacy`,
  `/terms`, and the 404 response at desktop and 390px mobile, including after
  setting text to 200%.
- All non-404 routes have zero horizontal overflow at 390px and 200% text.
  Visible links/buttons tested at both widths are at least 44×44 CSS pixels.
- Keyboard smoke testing confirmed the skip link is first, Enter moves focus
  to `#main`, the dual focus ring is visible, the verify dialog focuses its
  file input, Escape closes it, and focus returns to the trigger.
- Reduced-motion mode has zero running animations.
- The service worker controls `/demo`, `registration.update()` completes with
  no waiting worker, only cache `apk-locker-v20` remains, and an offline reload
  restores the shell, banner, and two demo records.
- Defect: at 390px and 200% text, the actual 404 response has 489px scroll
  width for a 390px viewport. The non-wrapping wordmark causes the extra 99px.

The expected browser resource message for the deliberate top-level HTTP 404
was observed; no application-script error occurred.

Evidence: `verification-evidence-16/live-audit.json`,
`verification-evidence-16/404-mobile-200.png`, and the root/demo URL-verifier
artifacts.

## Performance — PASS

Fresh mobile Lighthouse on live `/` (successful run, no runtime error):

| Metric | Result |
| --- | ---: |
| Performance | 96 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 0.90 s |
| LCP | 1.35 s |
| CLS | 0 |
| TBT | 237 ms |
| Initial transfer | 97,337 bytes (95 KiB) |

Lighthouse does not provide a lab INP value for this load. The bundle and
loading metrics meet the contract budgets.

Evidence: `verification-evidence-16/lighthouse-mobile.json`.

## Link and route checks — PASS

Every rendered link across `/`, `/demo`, `/privacy`, `/terms`, and `/404.html`
resolved below HTTP 400 after redirects. This includes the four GitHub release
downloads and Sociobot hosted checkout. Product routes have distinct titles,
descriptions, canonicals, one H1, one main, and no normal-width overflow. An
unknown URL returns the styled HTTP 404.

Evidence: `verification-evidence-16/link-audit.json`.

## Defects

| Severity | Finding | Required correction |
| --- | --- | --- |
| **Critical** | Live web build claims candidate `20f18f0...`, but v0.5.10 APK/AAB, tag, notes, and provenance identify `ab3eb699...`. The published-release test fails for the candidate. | Publish a new version/tag from the accepted candidate, rebuild APK/AAB/checksums/provenance, point the landing page to it, then make the tagged `release-assets` claim verify the published files rather than only rendered URLs. |
| **Medium** | The 404 page overflows horizontally by 99px at 390px/200% text because `.wordmark` is `white-space: nowrap`. | Allow the wordmark to wrap or otherwise reflow without clipping/sideways scrolling, and add the 404 route to the 200%-text regression. |

**Final disposition: FAIL.**
