# Independent product verification — FAIL

**Result:** **FAIL — do not release as APK Provenance Locker**  
**Checked-out candidate:** \`be05f78b4d483631f542d83aa0f26a6b60915b59\`  
**Requested candidate string:** \`be05f78b4d1af0d26c50b905092e56ec59425ac9\` (not an object in this clone)  
**Live URL:** <https://apk-provenance-locker.sociobot.in>  
**Verified:** 2026-08-29 UTC

The work-order base and checked-out \`origin/main\` resolve to the checked-out
commit above. The requested full SHA is unavailable locally, although it has
the same \`be05f78\` prefix. The deployed HTML, JS, and CSS SHA-256 values match
a fresh production build of the checked-out commit exactly, so the live results
below apply to that candidate.

## Release-blocking finding

### Critical — the product does not perform the core provenance job in the researched brief

The researched acceptance contract requires an inventory tool that verifies
**v1/v2/v3 signer lineage**, records source and hash, and warns before an
**incompatible downgrade**. Its pilot success measure is that a user can
identify every unexpected signer change and validate a restoration manifest
with zero hash/signature mismatches.

This candidate intentionally implements a materially narrower product:

- The deployed page says: “The web locker does not verify APK signatures, v1
  signers, v3 signer lineage, package names, version codes, or downgrade
  compatibility.”
- \`src/lib.ts\` reads one embedded v2/v3 certificate-byte digest and labels it
  “Not signature-verified”; it neither verifies APK signatures nor validates a
  signer chain/lineage. It has no v1 implementation.
- \`src/main.ts\` asks the visitor to enter the app name and version. It does not
  derive trusted package/version facts from \`AndroidManifest.xml\`.
- The only downgrade indication observed in the deployed flow was: “Version
  note: entered 1.0 sorts below entered 2.0. Android must decide downgrade
  compatibility.” It compares user-entered notes, so it cannot reliably detect
  an incompatible downgrade.
- Restore-kit validation recomputes stored file hashes only. It retains the
  unverified certificate digest as a record, rather than validating a signer.

The explicit limitation copy is honest, but it confirms the product does not
meet the original researched brief. A hash-and-notes locker is not sufficient
for the claimed provenance/recoverability job. Implement genuine APK signature
verification and v1/v2/v3 lineage handling, extract package/version identity
from APK metadata, and base signer-drift/downgrade warnings on those verified
facts; otherwise revise the product brief and acceptance contract before a
future release decision.

## Opening gates

### Claims: PASS

\`.factory/claims.json\` is present and contains 11 claim entries. From a clean
\`npm ci\`, every exact listed command was run independently against the
product's demo entry point and passed (one tagged Playwright test each):

| Claim ID | Result |
| --- | --- |
| \`hash-check\` | PASS |
| \`signer-evidence\` | PASS |
| \`apk-structure\` | PASS |
| \`encrypted-export\` | PASS |
| \`password-not-stored\` | PASS |
| \`local-storage\` | PASS |
| \`saved-copy-erasure\` | PASS |
| \`demo-sandbox\` | PASS |
| \`no-account-network\` | PASS |
| \`offline-reload\` | PASS |
| \`release-assets\` | PASS |

The current claim tests substantively check the declared narrow behavior: a
known SHA-256, unverified v2/v3 evidence labels, ZIP rejection, encrypted
export/decryption, password non-storage, persistence/removal, demo isolation,
same-origin demo requests, offline reload, and direct release links.

### Cold first read: PASS

A fresh 1440 px browser context opened the live landing page without stored
state. The first screen says what it does (“Keep APK restore evidence”), names
the audience (“Android sideloaders”), and offers the one-click action “Try it
with sample data” with the outcome “See a ready-to-check locker.” The action
opens \`/demo\`, which shows two realistic sample records and the persistent
“Demo — sample data, nothing is saved” banner with Reset demo and Start for
real controls.

## Local quality gates: PASS

- \`npm ci\` completed: 188 packages, 0 audit vulnerabilities reported.
- \`npm test\` passed: 9 Vitest tests and 14 Playwright tests.
- \`npm run test:unit\` passed: 9 tests.
- \`npm run test:browser\` passed: 14 tests.
- \`npm run lint\` passed (\`tsc --noEmit\`).
- \`npm run build\` passed and produced \`dist/\`.

## Deployed functional exercise: PASS for the implemented narrow scope

Using the actual published \`app-release.apk\` in a fresh live browser context:

1. A non-ZIP \`.apk\` was rejected with “This file is too short to be an APK.”
2. Replacing it with the published APK recovered successfully and recorded the
   local hash/copy.
3. A password-encrypted restore kit downloaded successfully.
4. The wrong restore password produced “That password did not open this restore
   kit.” The correct password then produced “1 hashes match.”
5. Entering version \`1.0\` after \`2.0\` produced the limited note quoted in the
   critical finding above.

The demo reset/leave behavior, saved-copy erasure, malformed ZIP rejection,
embedded certificate-byte fixture, and a 12 MiB encrypted export are also
covered by the passing browser tests. These validate the stated implementation,
not the missing cryptographic provenance requirements.

## Privacy, PWA, accessibility, and performance: PASS

- During a cold live load and during the complete record/export/validate flow,
  Playwright recorded only \`https://apk-provenance-locker.sociobot.in\` requests.
  There were no page errors or console errors. No account control was present.
  GitHub is contacted only if the visitor selects a release download.
- The live HTML and asset responses send CSP (\`connect-src 'self'\` and
  \`frame-ancestors 'none'\`), HSTS, \`nosniff\`, strict-origin referrer policy,
  and a restrictive permissions policy. Hashed JS/CSS responses are cached
  \`max-age=31536000, immutable\`; the web manifest is
  \`application/manifest+json\`; an unknown route returns HTTP 404.
- The live service worker was controlling \`/demo\`. With browser HTTP cache
  disabled and the context offline, reload retained the page heading and both
  seeded sample records. Its update implementation uses versioned cache
  cleanup, \`skipWaiting\`, and \`clients.claim\`; the app listens for
  \`updatefound\` and offers a reload control.
- Live axe scans had zero violations (therefore zero serious/critical) on
  \`/\`, \`/demo\`, \`/privacy\`, and \`/terms\` at desktop and at 390 x 844. Each had
  \`lang=en\`, one \`h1\`, one \`main\`, no console/page errors, and no horizontal
  overflow at 200% root text. Keyboard Tab begins at the visible Skip to
  content link (3 px focus ring); activating it moves focus to the \`h1\`.
  Reduced-motion emulation found no nonzero animations/transitions.
- Mobile Lighthouse 13.4.1: Performance 91, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.8 s, LCP 1.3 s, CLS 0, TBT 380 ms.
- Fresh build budgets: JS 23,588 B raw / 8,565 B gzip; CSS 9,442 B raw / 2,934
  B gzip; hero WebP 75,842 B. All are within the stated static-product limits.

There are no product server-side endpoints or sign-in flows. Rate-limit and
Microsoft Entra External ID checks are therefore not applicable.

## Android release and deployment identity: PASS

The landing-page links resolve to GitHub v0.2.0 assets. Downloads and checksum
verification succeeded:

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| \`app-release.apk\` | 3,929,072 | \`6608a8371086c3fa17ac87036a9748e5801542ad9d2302ce89539c0aea44a7ec\` |
| \`app-release.aab\` | 3,749,635 | \`78134ef4b24f4730c109e8782b5a7573002adf15b72ad824c9e4ae6f4f2207fb\` |

\`sha256sum -c SHA256SUMS\` returned OK for both assets. The APK is a valid
archive containing \`AndroidManifest.xml\` and the bundled web app; independent
Android manifest parsing reports package
\`in.sociobot.apk_provenance_locker\`, version code \`2\`, version \`0.2.0\`, and
v1/v2 signing-block presence. The APK's bundled \`index.html\`, JS, and CSS match
the fresh local \`dist/\` files byte-for-byte.

The same fresh local build matches the live deployment:

| File | SHA-256 |
| --- | --- |
| \`index.html\` | \`01966cae33b557ce6997b953267622431eda945defbb7bcfc7d807b6e645ab8a\` |
| \`assets/index-CqPAtxi8.js\` | \`1df303431278d5ad4fa7ca643c8b22ff29cfc94989fff3ad02eded64d6bb3fbb\` |
| \`assets/style-vLxLalKb.css\` | \`ce518c7b1b2d7c840d35f9ac0ac4b0cd0e56d56f7e89ab5d5952ee234b7bce4e\` |

## Disposition

**FAIL.** The repaired deployment, APK release, claims, local quality gates,
privacy/network behavior, accessibility, PWA offline behavior, and performance
all pass for the product that was built. It remains a release-blocking failure
against the researched APK Provenance Locker contract because it does not
cryptographically verify signer provenance or provide verified
package/version-based downgrade safety.

