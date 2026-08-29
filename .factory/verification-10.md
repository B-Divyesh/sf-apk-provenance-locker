# Independent product verification 10 — PASS

**Result:** **PASS — accept candidate `c5865bba6cf1833f5662e1c1ecdbe1104836bf0f`.**

**Live URL:** <https://apk-provenance-locker.sociobot.in>

**Verified:** 2026-08-29 UTC  
**Work order:** `apk-provenance-locker-verify-10`

No release-blocking defects were found. Product source was not changed during
verification; this report and the handoff are the only changes made.

## Mandatory opening gates

### Claim tests — PASS

`.factory/claims.json` exists and contains 23 claims. From the clean candidate
checkout, after `npm ci`, every declared command was run separately through
the local `/demo` entry point. Each selected exactly one passing test:

`hash-check`, `signature-verification`, `v1-verification`,
`tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`,
`signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`,
`local-storage`, `android-backup-disabled`, `saved-copy-erasure`,
`demo-sandbox`, `no-account-network`, `apk-never-uploaded`,
`offline-reload`, `offline-verification`, `release-assets`, `paid-unlock`,
`revoked-license`, and `hosted-checkout`.

The landing page, policies, and README were cross-checked against the claims
file. No unlisted testable product promise was found.

### Cold first read — PASS

In a fresh live desktop context, the first screen states:

- **What it does:** “Verify APKs before restoring.”
- **For whom:** “For Android sideloaders who need verified package, version,
  signer, lineage, and hash evidence before a reinstall.”
- **First click:** “Try it with sample data” followed by “See a ready-to-check
  locker.”

That one click opens `/demo` with realistic F-Droid and KeePassDX records plus
the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**,
and **Start for real**. The cold page had no console or page errors.

## Clean checkout and build — PASS

- Checkout started at `c5865bba6cf1833f5662e1c1ecdbe1104836bf0f`.
- `npm ci`: PASS; 189 packages installed; audit reported 0 vulnerabilities.
- `npm test`: PASS; 17 unit/integration and 34 browser tests.
- `npm run test:unit`: PASS; 17/17.
- `npm run test:browser`: PASS; 34/34.
- `npm run lint`: PASS (`tsc --noEmit`).
- Exact `npm run build`: PASS; `dist/` produced. Initial JS is 39,053 B raw /
  13,910 B gzip and CSS is 10,648 B raw / 3,200 B gzip, both within budget.

## Live behavior, privacy, and offline — PASS

Fresh live Playwright contexts exercised normal, invalid, recovery, boundary,
and removal paths on desktop and 390 px mobile:

- `npm run test:live`: PASS on desktop and mobile. It verified a genuine
  signed APK, opened then cancelled removal, and observed only same-origin
  GETs with zero console/page errors.
- A non-APK produces “This file is too short to be an APK.” Replacing it in
  the same dialog successfully verifies the signed release APK.
- The published APK verifies as `in.sociobot.apk_provenance_locker`, version
  `0.5.1` / code `6`, SHA-256
  `158df45f8a7526ac957d816cacb67db95a3a9ed46ba15743eceb8285ea7f88ae`,
  with v1+v2 signatures. This hash matches `v0.5.1` `SHA256SUMS`.
- Mismatched export passwords produce “The two passwords do not match.” A
  wrong restore password produces “That password did not open this restore
  kit.” Correcting it validates the kit.
- A fresh 20-record live flow, with saved signed APK copies, exported a
  632,618-byte encrypted kit and returned **“20 APKs match.”** It made seven
  same-origin GETs, no request body, no third-party request, and no console or
  page error.
- With an active service worker, a fresh `/demo` context reloaded offline with
  sample data and successfully verified the v1 fixture offline.

Request logs during complete verify/export/restore flows contained no APK
upload, analytics, account, font/CDN, GitHub API, or other automatic
third-party request. The only external request path is the explicit license
or download action, as documented.

## Deployment and Android artifact provenance — PASS

Live `/build.json` identifies product `apk-provenance-locker`, version `0.5.1`,
and commit `c5865bba6cf1833f5662e1c1ecdbe1104836bf0f`. Local production build
and live files have matching SHA-256 values:

| File | SHA-256 | Result |
| --- | --- | --- |
| `index.html` | `fbd987b645a3bb11843daa0be250bb09711556bd180bf96676d89e403a854e9d` | MATCH |
| `build.json` | `411a65fd98d261abd2c9b124c0dcee4c0003fbff98638e1de2bc9fa8f85ab237` | MATCH |
| `assets/index-B0_nbO_j.js` | `aca266f60bd50c8f2a778780a2e4060f754286c365549df60bf007ce9b17d2b3` | MATCH |
| `assets/style-CGu8n7Fe.css` | `6efe85e695e4bf4f639a96836557f3469b60f07cf5827e307f8fe125b7f11c0c` | MATCH |

The three landing download links resolve to the v0.5.1 APK, AAB, and checksum
assets. APK (5,587,336 B) and AAB (5,407,860 B) both match the published
`SHA256SUMS`; the APK contains `AndroidManifest.xml`, Capacitor assets, and
the built product. The product itself read its released Android manifest as
package `in.sociobot.apk_provenance_locker`, version 0.5.1/code 6. The claimed
Android backup protections pass their dedicated static claim test.

**Informational traceability note (not a defect):** the v0.5.1 tag resolves to
`8fbbb02623dd765d341f4cdfdf6ae524b8934a3e`; its packaged web `build.json`
names that tagged commit. Candidate `c5865bb` is its direct descendant and the
only difference is factory handoff/evidence documentation, not product source.
The live web build correctly identifies and byte-matches `c5865bb`; no Android
rebuild is required for a documentation-only child commit.

## Accessibility, mobile, security, and performance — PASS

- Axe found zero violations, including zero serious/critical findings, on
  `/`, `/demo`, `/privacy`, and `/terms` at desktop and 390 px widths.
- Each tested route has `lang=en`, a route-specific title, one h1, and a main
  landmark. The skip link visibly focuses (3 px light outline) and moves focus
  to the page h1; dialogs close with Escape and return focus to their trigger.
- At 390 px/200% text, the released APK’s unbroken package name and long
  GitHub source URL fit in the evidence dialog: dialog `scrollWidth` equals
  `clientWidth` (367 px), document width remains 390 px, and the source link
  is visible. All sampled visible controls meet 44 px minimum targets.
- `prefers-reduced-motion: reduce` leaves no nonzero animation or transition
  duration.
- HTTP responses provide HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, and a CSP with header-only
  `frame-ancestors 'none'`. HTML/SW revalidate after 30 seconds; hashed
  JS/CSS/WASM are one-year immutable; the manifest has correct MIME type and
  one-day caching. Unknown routes return the styled HTTP 404.
- Lighthouse 12.8.2 mobile `/demo`: Performance **99**, Accessibility **100**,
  Best Practices **100**, SEO **100**; FCP 0.9 s, LCP 1.4 s, TBT 130 ms,
  CLS 0.

## Billing endpoint and links — PASS

The optional license verifier is the only server-side product endpoint. A
fresh 40-request same-client burst to the documented Sociobot verify endpoint
returned **30 × 200** and **10 × 429**. Every 429 carried `Retry-After: 4`;
observed allowance is therefore 30 requests per burst. CORS allowed only the
product origin. Hosted checkout returned 303 to Dodo. There is no sign-in,
product backend, or server-side persistence, so Microsoft Entra, backend
health, and persistence-boundary checks do not apply.

## Defects by severity and disposition

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.
- **Informational:** the v0.5.1 Android artifact embeds its tagged parent
  build identity, as described above; candidate changes are documentation-only.

**Disposition: PASS.**
