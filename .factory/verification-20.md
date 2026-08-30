# Independent product verification 20 — FAIL

**Candidate:** `a880c5790be7699a06a3d6de58649f738a444675`  
**Live URL:** <https://apk-provenance-locker.sociobot.in>  
**Verified:** 2026-08-30 UTC  
**Work order:** `apk-provenance-locker-verify-20`

## Decision

**FAIL — do not release this candidate.** The live paid checkout is broken:
`GET https://api.sociobot.in/api/v1/products/apk-provenance-locker/checkout`
returned HTTP 500 with `{"error":"Internal server error","status":500}` on four
consecutive independent probes. The full repository suite also failed twice on
the corresponding browser test, with 39/40 browser tests passing and this one
receiving 500 instead of the required 303 Dodo redirect. This makes the visible
`Buy Locker Plus — $12` action unusable and fails the required full test gate.

The originally reported deployment-only release-claim problem is fixed: all
26 exact claim commands passed from this clean candidate checkout, including
`@claim:release-assets`.

## Required opening gates

### Claims — PASS (26/26)

`.factory/claims.json` exists, has 26 unique claim IDs, and I ran every listed
command separately, in manifest order, after `npm ci`. Every command exited 0:

`hash-check`, `signature-verification`, `v1-verification`,
`tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`,
`signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`,
`local-storage`, `android-backup-disabled`, `saved-copy-erasure`,
`demo-sandbox`, `no-account-network`, `apk-never-uploaded`, `offline-reload`,
`offline-verification`, `release-assets`, `paid-unlock`, `free-core-features`,
`revoked-license`, `hosted-checkout`, `restore-import`, and
`saved-apk-download`.

The checkout claim happened to receive its required redirect during that first
standalone run. It later returned deterministic 500s in the complete suite and
direct live probes, so the one passing invocation is not evidence of a working
customer action.

Evidence: `verification-evidence-20/claims-all.log`,
`full-test-retry.log`, and `billing-endpoints.json`.

### First read and one-click demo — PASS

Cold at desktop and 390 px, the first screen says **“Verify APKs before
restoring”**, identifies **“Android users keeping APK files”**, and presents
**“Try it with sample data”** with the plain outcome **“Open two sample APK
records.”** One click opens `/?demo=1`, shows two realistic sample records,
and displays the persistent **“Demo — sample data, nothing is saved”** banner
with **Reset demo** and **Start for real**.

Evidence: `cold-and-demo.json`, `live-cold-mobile.png`, and
`live-demo-mobile.png`.

## Repository gates

- `npm ci`: passed; 189 packages installed, zero vulnerabilities reported.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and produced `dist/`. Initial JS is 44,565 bytes
  (15.40 KB gzip) and CSS 11,221 bytes (3.35 KB gzip), within the static
  bundle budgets.
- `npm test`: **failed twice**. Both runs passed 24 Vitest tests; the retry
  passed 39/40 Playwright tests and failed only `@claim:hosted-checkout`:
  expected HTTP 303, received HTTP 500.
- `npm run test:live`: passed at desktop and 390 px: genuine signed APK
  verification, removal confirmation, same-origin bodyless GETs, and zero
  console/page errors.
- `npm run test:candidate -- --expected-commit a880c579...`: passed;
  candidate is obtainable and identical to `main`.

## Live product, boundaries, and privacy

The live 390 px flow verified the genuine signed fixture as
`android.appsecurity.cts.tinyapp` 1.0 (code 10), v1/v2/v3 signatures, and
recoverable record state. A three-byte `.apk` is rejected with **“This file is
too short to be an APK.”** The claim suite additionally covered v1-only,
tampered, invalid-lineage, signer-drift, downgrade, encrypted export/import,
saved-copy byte identity, passwords, persistence, demo erasure, and a
20-record restoration set.

Cold landing, demo, signing, and removal made only product-origin bodyless
GETs; no APK bytes, passwords, records, analytics, or automatic third-party
requests left the browser. Root headers include HSTS, `nosniff`, strict-origin
referrer policy, restrictive Permissions Policy, and a CSP with
`frame-ancestors 'none'`. Hashed JS/CSS and verifier assets are one-year
immutable; HTML, app shell, images, and worker revalidate in 30 seconds.

The single-client license-verify allowance works: 30 requests received 200;
request 31 and later received 429 with `Retry-After: 4` and the product-origin
CORS header. This passes the rate-limit requirement. It does not repair the
separate checkout 500.

Evidence: `live-smoke.log`, `live-boundaries.json`, `cold-and-demo.json`,
`billing-endpoints.json`, and `live-root.headers`.

## Deployment and Android artifact

Live `/build.json` names this exact candidate, and all 20 public files from a
fresh local production build matched the live responses byte-for-byte. The
unknown route returns 404. The v0.5.12 Android release itself remains
internally consistent: default `npm run test:release` passed and verified the
5,589,035-byte APK and 5,409,557-byte AAB against checksums, release
provenance, packaged identities, and demo-storage erasure. Those immutable
assets correctly identify their release source as `058fe2c...`; the newer
candidate is a deployed static-site/verification repair and the live page
accurately distinguishes the APK source.

Evidence: `deployment-identity.json`, `live-build.json`,
`release-check-tag.log`, and `release-check-current.log`.

## Accessibility, PWA, and performance

`verify-url.sh` passed live `/` and `/demo` with zero console errors. Axe found
zero serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, and
`/404.html` at desktop and 390 px, including 200% text with no horizontal
overflow. Keyboard Tab begins at the skip link; Enter moves focus to the H1
inside main, dialogs open on the file input and close with Escape, and the
visible dual focus ring is 3 px light outline plus dark outer ring. Reduced
motion leaves zero animations/transitions.

The live service worker controls `/demo`, has no waiting update, retains only
`apk-locker-v22`, and offline reload restores its banner and two samples with
no errors. Fresh mobile Lighthouse measured FCP 1.0 s, LCP 1.5 s, CLS 0, and
95 KiB transfer. Its performance score was **87**, below the factory target of
90; this is a high-severity quality-budget miss, though the broken checkout is
already release-blocking.

Evidence: `live-accessibility.json`, `live-keyboard-motion.json`,
`skip-link.json`, `live-pwa.json`, and `lighthouse-summary.json`.

## Defects

| Severity | Finding | Required correction |
| --- | --- | --- |
| **Critical / release-blocking** | The live Sociobot checkout endpoint returns HTTP 500 instead of a 303 redirect to a Dodo checkout session. The Buy Locker Plus link is unusable; the full suite fails twice on this behavior. | Repair or correctly register the factory billing product/checkout configuration, then rerun `npm test`, the `@claim:hosted-checkout` command, and a live redirect probe. |
| **High** | Fresh mobile Lighthouse performance is 87, below the stated ≥90 target. | Profile the live LCP/render path and reduce the bottleneck; rerun a fresh mobile Lighthouse audit. |

No product source code was changed by this verification. This report, handoff
status, and evidence are the only repository changes.
