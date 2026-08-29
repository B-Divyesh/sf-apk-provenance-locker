# Independent verification 6 — FAIL

Verified 2026-08-29 10:40 UTC against candidate commit
`aa342a3dce20ea5df5fc3f1b58290ec4b47b607b` and
`https://apk-provenance-locker.sociobot.in`.

## Verdict

**FAIL.** The cold first-read gate, all 19 declared claim tests, the full local
suite, the live web deployment, privacy checks, offline behavior, and the core
20-record restoration flow pass. Release acceptance is nevertheless blocked
by one high-severity and three medium-severity findings:

1. the Android APK/AAB linked from the candidate are built from an older
   commit, not the candidate under test;
2. recurring interactive links miss the required 44 by 44 CSS-pixel target;
3. the brief's one-time paid unlock is absent; and
4. a release-safety promise in the README is not declared in
   `.factory/claims.json`.

No critical findings were found. Product code was not modified during this
verification.

## Release-blocking findings

### F-6-1 — High — Published Android packages do not match the candidate

The landing page and README link to the `v0.3.0` APK and AAB, but that tag points
to `29891996aed3d5cd66867aa29ff6b87ee617d009`, while the candidate and
`origin/main` are `aa342a3dce20ea5df5fc3f1b58290ec4b47b607b`.

Fresh evidence from the downloaded APK:

- published APK SHA-256:
  `cdaf8cbc1e6cdf0921fb53e959e4900c0e29c9d768165daa759385ba56f5bbe3`;
- published AAB SHA-256:
  `f6941bfa20c5f2bfa9eead06c680d37b91fe0a45b561cbe89e45afb21a7198af`;
- both values match the published `SHA256SUMS`;
- the APK bundles `assets/index-CTSmEZV-.js`, 32,749 bytes, SHA-256
  `207feb2a0f56766a6a4ee0b8d8326348c4e546c25feb55b54e3c0ee74a17ab8b`;
- the candidate build bundles `assets/index-Djz-0ur2.js`, 32,807 bytes,
  SHA-256
  `d8911201693719a446ef88a65a081af6426036a76f62ad56d23f4b21f23b7856`;
- the APK's bundled `index.html` hashes to
  `9d05af561395d245a467e772d768f1420ed557c4149ddc63378abcd238cbaaa9`,
  while the candidate `dist/index.html` hashes to
  `3a463e925ed772b566377f108731964bbb3d0ff5fa2b68544db6f30fb745de34`;
- the APK still contains copy removed after the release tag, including
  “A local evidence locker” and “This build uses a release-specific test key.”

The packages are valid artifacts, but they are not artifacts of this
candidate. The APK independently verified as package
`in.sociobot.apk_provenance_locker`, version `0.3.0` / code 3, with v1 and v2
signatures. It is 5,583,235 bytes; the AAB is 5,403,880 bytes. Both archives
contain an Android manifest. Publish packages built from the accepted commit
under a new version/tag, update the links and checksums, then reverify them.

### F-6-2 — Medium — Some recurring links are below 44 by 44 CSS pixels

Independent Playwright geometry checks found these visible/focusable target
boxes:

- desktop header wordmark: 224 by 24 px;
- desktop and mobile footer “Terms”: 39 by 44 px;
- focused skip link: approximately 138 by 40 px.

This misses the attached accessibility and site-structure minimum even though
axe reports no violation. Increase the clickable padding or minimum dimensions
without reducing the visible focus treatment.

### F-6-3 — Medium — The brief's one-time paid unlock is not implemented

The supplied researched brief defines monetization as a one-time purchase.
The candidate has no price or paid-tier explanation, Sociobot checkout URL,
`sb_license:apk-provenance-locker` handling, daily license verification, or
“Have a license?” restore control. A source search found none of `checkout`,
`sb_license`, `restore purchase`, or a Sociobot product endpoint.

The free core is useful and remains available, but the work order's business
scope and paid-unlock contract are incomplete. Implement any paid tier only
through `https://api.sociobot.in/api/v1/products/apk-provenance-locker/...`;
do not gate accessibility, safety warnings, or core export.

### F-6-4 — Medium — A README promise is missing from the claim registry

README says: “The release workflow builds the APK and AAB. It checks their
size, package ID, manifest, signature, and checksums.” This is a release-safety
statement a user can rely on, but none of the 19 claim entries declares it.
`release-assets` tests only the three deterministic download links and absence
of an automatic GitHub API request.

A normal untagged unit test inspects workflow source text, but the claims
contract requires the promise in `.factory/claims.json` with exactly one
`@claim:<id>` observable test. Add that claim and test the produced packages,
or remove/narrow the README promise.

## Mandatory first-read and demo gate

**Pass.** A cold 1440 by 900 load returned 200 with no console or page errors.
Before scrolling, it plainly answers:

- what: “Verify APKs before restoring”;
- for whom: Android sideloaders who need package, version, signer, lineage,
  and hash evidence before reinstalling;
- first click: “Try it with sample data,” next to “See a ready-to-check
  locker.”

One click opened `/demo`, titled “Demo — APK Provenance Locker,” with F-Droid
and KeePassDX records already populated. The persistent banner says “Demo —
sample data, nothing is saved” and exposes Reset demo and Start for real. The
only storage present was `demo:apk-locker:records`; no real namespace was read.
The first navigation requested only the product origin.

Evidence:

- `.factory/evidence/verification-6/first-read.png`
- `.factory/evidence/verification-6/demo-one-click.png`
- `.factory/evidence/verification-6/mobile-demo.png`

## Required claim tests

`.factory/claims.json` exists with 19 entries. Before broader inspection, every
listed command was run independently after `npm ci`; all exited 0. Source
cross-check found exactly one matching test tag for every declared ID.

Passed IDs:

`hash-check`, `signature-verification`, `v1-verification`,
`tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`,
`signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`,
`local-storage`, `saved-copy-erasure`, `demo-sandbox`, `no-account-network`,
`apk-never-uploaded`, `offline-reload`, `offline-verification`, and
`release-assets`.

The unlisted README statement is reported separately as F-6-4.

## Clean local gates

- `npm ci`: pass; 189 packages installed; npm reported 0 vulnerabilities.
- `npm test`: pass; 14 unit/config tests and 25 Playwright tests.
- `npm run lint`: pass (`tsc --noEmit`).
- `npm run build`: pass; `dist/` produced.
- clean detached candidate worktree: `npm ci`, `npm run build`, and
  `npx cap sync android` all pass; app ID is
  `in.sociobot.apk_provenance_locker`.
- Android Gradle execution is intentionally a GitHub Actions packaging step;
  this worker has no Java or Android SDK. The published artifacts were
  downloaded and inspected instead.

Production build sizes:

- initial JS: 32,807 bytes raw / 12,160 bytes gzip;
- CSS: 9,645 bytes raw / 2,980 bytes gzip;
- hero WebP: 75,842 bytes;
- apksig WASM: 5,828,623 bytes, loaded only when a user selects an APK.

The initial JS, CSS, and hero budgets pass.

## End-to-end and recovery evidence

`npm run test:live` passed at desktop and 390 by 844 mobile. A real Android
fixture verified v1, v2, and v3 signatures and a three-certificate lineage.
Each viewport made seven same-origin GET requests and emitted no console/page
errors.

An additional live adversarial flow confirmed:

- `not a URL` is rejected with “Please enter a URL.”;
- a non-APK is rejected with “This file is too short to be an APK.”;
- the same dialog re-enables its action and then accepts a genuine v1 APK;
- 11 characters are rejected at the 12-character password boundary;
- mismatched passwords report “The two passwords do not match.”;
- ciphertext does not contain the package name;
- a wrong import password reports “That password did not open this restore
  kit.”, re-enables retry, and the corrected password succeeds;
- the final report says “1 APKs match.”

For the brief's success boundary, one verified saved APK was expanded to 20
records in the local locker namespace, exported, and validated. The UI showed
20 cards and then “20 APKs match”; all 20 results said hash, signature,
identity, and signer match. The kit was 180,578 bytes. The flow remained
same-origin with no request bodies or browser errors. The suite also covers a
12 MiB saved copy, tampering, malformed ZIP metadata, malformed lineage,
signer drift, downgrade risk, persistence, and deletion.

## Privacy and network

Fresh Playwright request logs for landing, demo, APK verification, error
recovery, export, and 20-record validation contained only
`https://apk-provenance-locker.sociobot.in`, only GET requests, and no request
bodies. No analytics, account call, GitHub API request, or APK upload occurred.
The cold response set no cookie. Source inspection found only the same-origin
WASM fetch and service-worker fetch handling. `npm audit --omit=dev` reported
zero vulnerabilities.

This is a static/local-first product with no server-side application or unlock
endpoint, so API allowance/429 testing, backend concurrency/health, and sign-in
authority checks are not applicable. No sign-in is present. AI would not
improve the exact cryptographic job and no AI runtime is present.

## Accessibility, mobile, routes, and PWA

- Live axe scans on `/`, `/demo`, `/privacy`, and `/terms` at desktop and
  390 px: zero total violations, hence zero serious/critical findings.
- Each route has `lang=en`, exactly one `h1`, and one `main`.
- Keyboard: first Tab reaches Skip to content; focus outline is a visible
  3 px solid `rgb(255, 154, 111)` ring; Enter moves to main content; Enter on
  Verify an APK focuses the file input; Escape closes and restores trigger
  focus. There was no trap.
- Reduced-motion mode yielded zero active animations or transitions.
- At 390 px with root text at 200%, document width remained 390 px with no
  horizontal loss. The undersized target finding remains F-6-2.
- `/`, `/demo`, `/privacy`, `/terms`, robots, sitemap, manifest, icons, and
  social image return 200. An unknown route returns the designed 404.
- All rendered internal links and all three release links resolve; the release
  files were downloaded successfully.
- The service worker controlled `/demo` with cache `apk-locker-v6`; after HTTP
  cache disablement and offline mode, reload retained the shell and sample
  records. `registration.update()` completed with an active worker and no
  waiting/installing worker.

The required factory URL verifier passed: HTTP 200, 808 ms load, no errors,
title and language present, one h1, a main landmark, no missing image alt text,
and no unlabeled buttons. Its output is in
`.factory/evidence/verification-6/verify.json`.

## Deployment identity, headers, caching, and performance

The web deployment does match the candidate. Fresh local `dist/` and live
copies were byte-for-byte identical for `index.html`, hashed JS, hashed CSS,
service worker, hero image, web manifest, favicon, WASM loader, and WASM
binary. `origin/main` also resolved to the candidate commit.

Response headers include HSTS, `nosniff`, strict-origin referrer policy,
restrictive permissions policy, and a CSP with `connect-src 'self'` and
`frame-ancestors 'none'`. HTML uses `max-age=30, must-revalidate`; hashed JS,
CSS, and verifier assets use one-year immutable caching; manifest uses one
day. Matching `If-None-Match` requests returned 304.

Fresh Lighthouse 12.8.2 mobile audit of `/demo` at
2026-08-29T10:36:31.583Z:

- Performance 99, Accessibility 100, Best Practices 100, SEO 100;
- FCP 1.004 s, LCP 1.454 s, TBT 143 ms, CLS 0, Speed Index 1.004 s;
- seven requests, 93,462 transferred bytes, zero third-party bytes.

## Required remediation before reverification

1. Publish APK/AAB/checksums built from the accepted candidate under a new
   version/tag, update product links/version copy, and prove packaged web
   assets match the candidate.
2. Make every interactive target at least 44 by 44 CSS pixels and rerun the
   geometry check at desktop, 390 px, and 200% text.
3. Implement the brief's one-time Sociobot license unlock, or obtain an
   explicit scope change that removes monetization.
4. Register and uniquely tag the README release-artifact assurance, or remove
   that assurance.
5. Rerun every claim, the full suite, live privacy/PWA/accessibility checks,
   and package identity comparison.
