# Independent product verification 11 — PASS

**Result:** **PASS — accept candidate
`feb19fdeb9556f56c56c2e1e22c93dc2b5ed5d5c`.**

**Live URL:** <https://apk-provenance-locker.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Work order:** `apk-provenance-locker-verify-11`

Product code was not changed. This report and the handoff are the only QA
changes.

## Opening gates

### Claims — PASS

`.factory/claims.json` is present and declares 25 claims. After a clean
`npm ci`, I ran every declared `npm test -- --grep @claim:<id>` command
separately through the local demo entry point. Each selected one passing
test. The passing claims were:

`hash-check`, `signature-verification`, `v1-verification`,
`tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`,
`signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`,
`local-storage`, `android-backup-disabled`, `saved-copy-erasure`,
`demo-sandbox`, `no-account-network`, `apk-never-uploaded`,
`offline-reload`, `offline-verification`, `release-assets`, `paid-unlock`,
`revoked-license`, `hosted-checkout`, `restore-import`, and
`saved-apk-download`.

### Cold first read — PASS

Fresh live page, before interaction: “Verify APKs before restoring” explains
the job; the next sentence names Android users keeping APK files; and the
first primary action is “Try it with sample data” with “Open two sample APK
records.” This is plain and sufficient. One click opens `/demo`, immediately
shows two realistic F-Droid/KeePassDX records, and displays the persistent
“Demo — sample data, nothing is saved” banner with Reset demo and Start for
real.

## Clean candidate checks — PASS

- `npm ci`: passed; 189 packages installed, audit reported 0 vulnerabilities.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run test:unit`: 17/17 passed.
- `npm run test:browser`: 38/38 passed.
- `npm test`: passed (the same 17 unit and 38 browser checks).
- Exact production `npm run build`: passed and produced `dist/`.
- Initial JS is 42,018 B raw / 14,417 B gzip; CSS is 11,085 B raw / 3,296 B
  gzip — comfortably within the static-product budget.

## Product behavior, privacy, and accessibility — PASS

- `npm run test:live` passed on desktop and 390 px mobile: a real signed APK
  verified through `/demo`, removal confirmation was exercised, requests were
  five same-origin GETs per run, and there were zero console/page errors.
- Fresh Playwright checks opened a sample record/evidence dialog, confirmed
  two demo records and the reset/start-real controls, and reloaded `/demo`
  offline after first visit with both records still rendered.
- A full request log for landing then demo contained only the product origin,
  GET requests, and zero request bodies. No automatic third-party request,
  account, analytics, or APK upload was observed. The only code-level remote
  origins are an explicit GitHub download action and the explicit Sociobot
  license action, as disclosed.
- Axe on `/`, `/demo`, `/privacy`, and `/terms` found zero serious or critical
  violations. Every route had one h1 and one main landmark. The first Tab
  reaches the visible “Skip to content” link with a 3 px light outline and
  dark outer ring; at 390 px document scroll width equalled client width.
  Reduced-motion transition duration was `0s`.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with route-specific
  titles; an unknown path returned the designed HTTP 404. HSTS, `nosniff`,
  strict-origin referrer policy, restrictive permissions policy, and CSP
  `frame-ancestors 'none'` are response headers. Hashed JS/CSS cache for one
  year immutable; shell and service worker revalidate after 30 seconds.

## Deployment and Android artifact — PASS

Live `/build.json` is byte-identical to the candidate build and identifies
version 0.5.2 and commit `feb19fdeb9556f56c56c2e1e22c93dc2b5ed5d5c`.
The live JS, CSS, hero image, manifest, and service worker are byte-identical
to the local candidate build; for example the JS SHA-256 is
`fe8d0e86f80cd06637e55c2a124f1638f9cef3587b0a38672eff71fb12c21a29`.

Landing links returned 200 for the v0.5.2 APK (5,588,120 B), AAB (5,408,642
B), and SHA256SUMS. The downloaded APK SHA-256 is
`67adb0d6c6bf80ceb17ed0db8c8896fc74337c31eba779e24c83e44cfe76ce4c`,
which equals its published SHA256SUMS entry. It contains AndroidManifest.xml,
classes.dex, Capacitor assets, and the same built JS. Its embedded web
`build.json` names `752f078`, the v0.5.2 tagged product commit. This is
traceable rather than a mismatch: `752f078..feb19fd` changes documentation,
evidence, README, and handoff only; the packaged product asset hash above is
identical.

## Billing allowance — PASS

The only server endpoint used by the product is optional Sociobot license
verification. A same-client invalid-license burst received 200 responses
until the gateway allowance was exhausted, then 429 responses with
`Retry-After: 2`. In the final 25-request continuation, 23 were 200 and calls
24–25 were 429; combined with the preceding 12 requests, at least 35 requests
were accepted in the observed window. This confirms enforcement and supplies
the required Retry-After behavior. There is no sign-in or product backend, so
Entra, backend health, concurrency, and server persistence checks do not
apply.

## Defects and disposition

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
- Informational: the Android release embeds its tagged v0.5.2 product commit,
  while this candidate is a documentation/evidence descendant; web deployment
  itself is exactly the requested candidate.

**Disposition: PASS.**
