# Independent product verification 9 — FAIL

**Result:** **FAIL — do not accept candidate `3cf8abb27a28650519464571565f4995fd84aa65` yet.**

**Live URL:** <https://apk-provenance-locker.sociobot.in>

**Verified:** 2026-08-29 UTC

**Work order:** `apk-provenance-locker-verify-9`

The candidate is deployed, all 23 declared claims pass, the complete APK
workflow works, and the published v0.5.0 Android packages are genuine builds
of this commit. One independently reproduced mobile reflow defect still
violates the acceptance contract.

## Release-blocking finding

### Medium — the evidence dialog does not reflow on mobile or at 200% text

The main evidence view expands beyond its dialog when an ordinary Android
package name contains no breaking spaces. This is not a synthetic extreme:
the product's own published APK is named
`in.sociobot.apk_provenance_locker`.

On the live site at 390×844:

- At normal text size, the dialog is 367 CSS px wide but has a 502 px scroll
  width. The package heading extends to x=514, outside the 390 px viewport.
- At 200% text, the same dialog has a 983 px scroll width and 616 px of
  horizontal overflow. The package heading extends to x=995.
- The exact package name and source URL visibly run off the right side. A user
  must pan horizontally as well as vertically to read the provenance record.

This fails the attached mobile/accessibility requirement that text resize to
200% without loss and the product contract's mobile requirement. Axe reports
no violation because automated axe rules do not detect this content-dependent
reflow failure. The existing test covers the add, license, and removal dialogs
at 200%, but not the recorded-evidence dialog with long unbroken values.

Evidence:

- `verification-evidence-9/release-apk-mobile-evidence.png`
- `verification-evidence-9/live-details-mobile-200pct-overflow.png`

Fix the grid's minimum-content expansion so headings, links, and evidence
values can wrap, then add a 390 px / 200% regression assertion that the open
evidence dialog has `scrollWidth <= clientWidth` for the release package name
and a long source URL.

## Mandatory opening gates

### Claim tests — PASS

`.factory/claims.json` exists. After `npm ci`, every listed command was run
separately from the local `/demo` entry point. Each selected exactly one test,
and all 23 passed. The landing, policy pages, dialogs, and README were also
cross-checked against the claims file; no unlisted product claim was found.

| Claim | Result |
| --- | --- |
| `hash-check` | PASS |
| `signature-verification` | PASS |
| `v1-verification` | PASS |
| `tamper-rejection` | PASS |
| `lineage-integrity` | PASS |
| `apk-identity` | PASS |
| `downgrade-risk` | PASS |
| `signer-drift` | PASS |
| `apk-structure` | PASS |
| `encrypted-export` | PASS |
| `password-not-stored` | PASS |
| `local-storage` | PASS |
| `android-backup-disabled` | PASS |
| `saved-copy-erasure` | PASS |
| `demo-sandbox` | PASS |
| `no-account-network` | PASS |
| `apk-never-uploaded` | PASS |
| `offline-reload` | PASS |
| `offline-verification` | PASS |
| `release-assets` | PASS |
| `paid-unlock` | PASS |
| `revoked-license` | PASS |
| `hosted-checkout` | PASS |

### Cold first read — PASS

A fresh 1440×900 browser context opened `/` with no saved state:

- What it does: **“Verify APKs before restoring.”**
- For whom: **“For Android sideloaders…”** followed by the exact evidence it
  records.
- First action: **“Try it with sample data”**, with “See a ready-to-check
  locker.” beside it.

One click opened `/demo` with realistic F-Droid and KeePassDX records and the
persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**,
and **Start for real**. There were no console errors, page errors, uploads, or
third-party requests.

## Clean checkout, build, and tests

- Candidate and checkout: `3cf8abb27a28650519464571565f4995fd84aa65`;
  worktree clean before QA.
- `npm ci`: PASS; 189 packages, 0 vulnerabilities.
- `npm audit --audit-level=high`: PASS; 0 vulnerabilities.
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run test:unit`: PASS; 17/17.
- `npm run test:browser`: PASS; 33/33.
- `npm test`: PASS; 17 unit/integration and 33 browser tests.
- Exact `npm run build`: PASS; `dist/` produced.
- `npx cap sync android`: PASS and left no tracked changes.
- `npm run test:live`: PASS at desktop and 390 px; both verified a genuine
  signed APK and safely cancelled removal with same-origin GETs and no errors.

## End-to-end behavior

Fresh live demo contexts exercised the useful workflow and recovery paths:

- A non-ZIP `.apk` produced **“This file is too short to be an APK.”** Replacing
  it in the same dialog recovered and verified package
  `android.appsecurity.cts.tinyapp`, version `1.0` / code `10`, v1+v2+v3, with
  a three-certificate lineage.
- Mismatched export passwords produced **“The two passwords do not match.”**
  Correcting them downloaded an encrypted `.locker` file.
- A wrong restore password produced **“That password did not open this restore
  kit.”** Correcting it produced **“1 APKs match.”**
- A 20-record set with 20 separately stored copies of the genuine signed test
  fixture exported as a 631,378-byte encrypted kit and later produced **“20
  APKs match.”** This exercises the brief's pilot-size count and repeated
  verification path, though it does not substitute for a field trial with 20
  distinct apps.
- The suite separately covers 12 MiB export, signer drift, downgrade risk,
  tampered bytes, malformed lineage, v1-only signatures, cancellation, and
  confirmed record/file erasure.

## Deployment and Android artifact provenance

The web deployment exactly matches the candidate:

| File | Local/live SHA-256 | Result |
| --- | --- | --- |
| `index.html` | `98c2a2a9afadec27acd6542bc9a275905f11d751e71fde0335c2a16fef59942f` | MATCH |
| `build.json` | `3d0c5fc63e45585de4356f349b850dcd6f60dce19230481a750d87d794e1bde7` | MATCH |
| `assets/index-CY-rqo4P.js` | `b20cdacd4e83a0be598eaf41f2a904a76a2e1760f94985ee3fd56667c8e24575` | MATCH |
| `assets/style-BnRjMvN1.css` | `b2074c50a5895cdb2a5466b685b27ea6a60419bb4c65c23f1e333a2c43bf97f0` | MATCH |

Live `/build.json` names version 0.5.0 and the full candidate commit. `/`,
`/demo`, `/privacy`, and `/terms` return 200; an unknown route returns the
designed page with HTTP 404. All 14 unique discovered links resolved: internal
links returned 200, checkout returned 303, and release assets returned valid
GitHub download redirects.

The published `v0.5.0` tag resolves to this candidate. Release evidence:

- APK: 5,587,336 bytes,
  SHA-256 `a2c18f2263ef9e6d0630f76c04a0709dfd811142a21c0d250a93a92f1bc0bdf6`.
- AAB: 5,407,860 bytes,
  SHA-256 `16b1f1497da52288a976db5b88a2ad9f053065f7e916c418877c6048a9ab1e8c`.
- Both match the published `SHA256SUMS`; every file under local `dist/`
  byte-matches its embedded APK and AAB counterpart; both embedded
  `build.json` files name the candidate.
- Independent APK parsing found package
  `in.sociobot.apk_provenance_locker`, version 0.5.0/code 5, min SDK 22,
  target SDK 34, only `INTERNET` plus the app-scoped dynamic-receiver
  permission, valid v1+v2 signatures, and no v3 signature.
- The live product independently verified that APK's v1+v2 signature, package,
  version, code, signer, and exact published hash.
- The packaged manifest has `allowBackup=false` and references both backup
  rule formats. Decoding the packaged resources confirmed that root, file,
  database, shared preferences, and external domains are excluded from both
  cloud backup and device transfer.

## Privacy, headers, billing, and rate limit

The complete live verify/export/restore/20-record flow made only same-origin
GET requests with empty bodies. The separate published-APK flow made seven
same-origin GETs. Neither flow made an APK upload, analytics request,
third-party font/script request, GitHub API request, console error, or page
error.

Live responses send CSP including header-only `frame-ancestors 'none'`, HSTS,
`nosniff`, strict-origin referrer policy, and a restrictive permissions policy.
HTML and `sw.js` revalidate after 30 seconds; hashed JS/CSS and verifier assets
have one-year immutable caching; the manifest has a one-day cache and the
correct MIME type.

The optional Sociobot license verifier was burst-tested from one client with
40 concurrent requests: 30 returned 200 and 10 returned 429. Every 429 had a
`Retry-After` header (observed 4 seconds), so the observed burst allowance is
30 requests. CORS echoed only the product origin. The hosted checkout returned
303 to `checkout.dodopayments.com`. The product has no backend or sign-in, so
product persistence/concurrency and Microsoft Entra checks are not applicable.

## Accessibility, PWA, and performance

- Axe 4.13: zero violations, including zero serious/critical findings, on all
  four live routes at 1440 px and 390 px and in the add dialog.
- Every route has `lang=en`, a route-specific title, one h1, one main landmark,
  and complete image alternatives. No console or page errors occurred.
- Keyboard use starts at the visible skip link; Enter moves focus to main.
  Enter navigation and browser back/forward focus the destination h1. Dialog
  focus, checkbox Space operation, Escape, and trigger focus return work.
- All sampled visible links/buttons and the saved-copy target meet 44×44 px.
  The dual focus treatment is visible; reduced-motion emulation leaves no
  nonzero animations or transitions.
- The mobile evidence-dialog reflow failure is the exception documented above.
- Service-worker update found only `apk-locker-v9`. With the HTTP cache disabled
  and the browser offline, `/demo` reloaded with sample records and a v1 APK
  verified successfully.
- Initial JS: 39,053 B raw / 13,785 B gzip; CSS: 10,464 B raw / 3,144 B gzip;
  hero WebP: 75,842 B; no font files. Budgets pass.
- Lighthouse 12.8.2 mobile `/demo`, three runs: Performance 89/100/99 (median
  99), Accessibility 100, Best Practices 100, SEO 100. Median FCP 0.91 s,
  LCP 1.36 s, TBT 134 ms, and CLS 0. No lab INP value was emitted.

## Disposition

Do not accept this candidate until the recorded-evidence dialog reflows at 390
px and 200% text, with a content-dependent regression test. Product code was
not modified during verification. Screenshots and full Lighthouse JSON are in
`.factory/verification-evidence-9/`.
