# Independent product verification 19 — FAIL

**Candidate:** `058fe2ce981fead74ea63fd612da05baaadaecfe`

**Live URL:** <https://apk-provenance-locker.sociobot.in>

**Verified:** 2026-08-30 UTC

**Work order:** `apk-provenance-locker-verify-19`

## Decision

**FAIL — do not accept this candidate.** One of the 26 required
`.factory/claims.json` commands failed during the first clean candidate run.
The acceptance contract explicitly makes any failed claim test release
blocking.

The product and published v0.5.12 artifacts otherwise work and match the
candidate. The earlier verification's intermittent checkout failure did not
recur: `@claim:hosted-checkout` passed on its first fresh run, and an
independent crawl reached a Dodo hosted session.

The new blocker is deterministic. `@claim:release-assets` first passes its
Playwright assertion, then invokes the release verifier. That verifier rejects
the candidate because it requires mutable `origin/main` to equal the old
candidate SHA exactly. Fresh Git evidence shows the candidate is obtainable,
is the v0.5.12 tag target, and is an ancestor of `main`; `main` is now two
verification-only commits ahead. An already-reported release therefore cannot
pass its own claim command.

## Required opening gates

### Claims — FAIL (25/26 passed)

`.factory/claims.json` exists with 26 unique IDs. From a clean checkout of the
exact candidate, I ran `npm ci`, then every listed `test` command separately
and in manifest order through the demo entry point.

The following 25 passed:

`hash-check`, `signature-verification`, `v1-verification`,
`tamper-rejection`, `lineage-integrity`, `apk-identity`, `downgrade-risk`,
`signer-drift`, `apk-structure`, `encrypted-export`, `password-not-stored`,
`local-storage`, `android-backup-disabled`, `saved-copy-erasure`,
`demo-sandbox`, `no-account-network`, `apk-never-uploaded`, `offline-reload`,
`offline-verification`, `paid-unlock`, `free-core-features`,
`revoked-license`, `hosted-checkout`, `restore-import`, and
`saved-apk-download`.

The failing command was:

```text
npm test -- --grep @claim:release-assets
```

The tagged browser test passed, then the command exited 1:

```text
origin/main is bca9bfc2975d65f1dc33f6bada36ab6fbd2ea08b;
push final candidate 058fe2ce981fead74ea63fd612da05baaadaecfe before release
```

`npm run test:candidate -- --expected-commit 058fe2c...` and the normal remote
mode of `npm run test:release -- --expected-commit 058fe2c...` reproduce the
same failure. The relevant graph is:

```text
058fe2c  fix: require obtainable release candidate identity   (tag v0.5.12)
7f7708e  docs: add verification 18 report
bca9bfc  docs: retain verification test logs                  (origin/main)
```

`git merge-base --is-ancestor 058fe2c bca9bfc` succeeds. The failure message's
instruction to push the candidate is therefore misleading: it is already
reachable from `main` and directly obtainable through GitHub's commit API.

Evidence: [`claims-summary.txt`](verification-evidence-19/claims-summary.txt).

### Cold first read and one-click demo — PASS

The fresh first screen answers all three required questions:

- What: **“Verify APKs before restoring.”**
- For whom: **“For Android users keeping APK files...”**
- First click: **“Try it with sample data”**, beside **“Open two sample APK
  records.”**

One click opens `/?demo=1`, shows two realistic records, and displays the
persistent **“Demo — sample data, nothing is saved”** banner with visible
**Reset demo** and **Start for real** controls. The first record begins within
the 390×844 viewport.

Evidence: [`live-cold-mobile.png`](verification-evidence-19/live-cold-mobile.png),
[`live-demo-mobile.png`](verification-evidence-19/live-demo-mobile.png), and
[`live-audit.json`](verification-evidence-19/live-audit.json).

## Candidate and deployment identity — PASS

- Live `/build.json` names version `0.5.12` and candidate `058fe2c...`.
- The v0.5.12 tag points directly to the candidate. GitHub's candidate API
  returns 200.
- The successful Android workflow run `33287232875` built that SHA.
- All 20 files meant to be publicly served from the fresh local `dist/` are
  byte-for-byte equal to the live responses. The deployment-only
  `staticwebapp.config.json` correctly returns 404 rather than being exposed.
- All 16 rendered links across `/`, `/demo`, `/privacy`, `/terms`, and the 404
  page resolve below 400 after redirects, including all release downloads and
  Sociobot checkout.

Evidence: [`deployment-audit.json`](verification-evidence-19/deployment-audit.json)
and [`link-audit.json`](verification-evidence-19/link-audit.json).

## Clean install, checks, tests, and build — PASS except required claim gate

- `npm ci`: passed; 189 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=high`: passed; 0 vulnerabilities.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm test`: passed; 23 Vitest unit/config tests and 40 Playwright tests.
- `npm run build`: passed and produced `dist/`.
- `npm run test:live`: passed on desktop and 390px mobile.
- `npx cap sync android`: passed in an isolated copy after adding the exact
  fresh `dist/` output.
- Initial production JS is 44,565 bytes / 15.40 KB gzip; CSS is 11,221 bytes /
  3.35 KB gzip; hero WebP is 75,842 bytes. These meet the stated budgets.

The normal aggregate `npm test` does not run the release verifier appended by
the exact `@claim:release-assets` command. Its pass does not cancel the
required-claim failure.

## End-to-end behavior and boundaries — PASS

A new independent live 390px flow confirmed:

- the demo starts with two records in its isolated namespace;
- non-ZIP bytes recover with **“This file is too short to be an APK.”**;
- an invalid source value is rejected with **“Please enter a URL.”**;
- the genuine signed fixture yields package
  `android.appsecurity.cts.tinyapp`, version `1.0` / code `10`, exact SHA-256
  `9c6947bf9398a15e85a52bf83b07cfae6686ff49e03034d09cbea45a19bdaa15`,
  verified v1/v2/v3, and verified signing history;
- an 11-character export password is rejected and the 12-character boundary
  is explained;
- mismatched and wrong restore passwords produce specific recovery messages;
- encrypted output does not contain the package name in plaintext;
- the correct password produces **“1 APK matches”**, with verified-copy
  download and import available;
- a 20-record encrypted restoration set validates as **“20 APKs match.”**

The claim suite additionally covers a v1-only APK, tampered signed content,
malformed v3 lineage, signer drift, downgrade warnings, record/saved-copy
erasure, a 12 MiB saved copy, restore conflicts, and byte-identical saved-copy
download.

Evidence: [`live-flow.json`](verification-evidence-19/live-flow.json) and
[`live-20-record-validation.png`](verification-evidence-19/live-20-record-validation.png).

## Privacy, headers, caching, and request allowance — PASS

- The complete independent verify/export/restore/20-record flow made 10
  requests. Every request was a bodyless GET to the product origin. No APK
  bytes, record content, passwords, analytics, advertising, or account data
  left the browser. There were zero page or console errors.
- Root responses include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive camera/microphone/geolocation/payment policy, and a CSP that
  permits only self plus the documented Sociobot API and denies framing.
- HTML, build identity, service worker, images, icons, sitemap, and robots use
  30-second revalidation. The manifest uses one-day caching. Hashed JS/CSS and
  the verifier runtime use one-year immutable caching.
- The only server-side product dependency is the Sociobot purchase/license
  service. A single client received 30 HTTP 200 license-verification responses;
  request 31 returned HTTP 429 with `Retry-After: 4` and the correct CORS
  origin.
- There is no product backend or sign-in. Backend concurrency, server
  persistence, health, and Entra authority checks are not applicable.

Evidence: [`live-flow.json`](verification-evidence-19/live-flow.json),
[`deployment-audit.json`](verification-evidence-19/deployment-audit.json), and
[`rate-limit.json`](verification-evidence-19/rate-limit.json).

## Accessibility, responsive behavior, and PWA — PASS

- Axe found zero serious or critical findings on `/`, `/demo`, `/privacy`,
  `/terms`, and a real 404 at desktop and 390px, including after 200% text.
- Every route has `lang=en`, exactly one H1 and one main landmark, complete
  image alternatives, distinct metadata, no horizontal overflow, and no
  undersized visible link/button targets.
- Keyboard navigation starts at **Skip to content**. The focused control has a
  3px light outline and 7px dark outer ring. Enter moves focus to main; the APK
  dialog opens on its file input, Escape closes it, and focus returns.
- Reduced-motion mode has zero running animations.
- `sw.js` controls `/demo`; `registration.update()` completed with no waiting
  worker; only cache `apk-locker-v22` remains. Offline reload restores the
  banner and both demo records without errors.
- `/opt/fleet/lib/verify-url.sh` passed both `/` and `/demo` with zero errors.
  Chromium logs the expected failed-resource message only for the deliberate
  top-level HTTP 404.

Evidence: [`live-audit.json`](verification-evidence-19/live-audit.json) and the
[`verify-url-root`](verification-evidence-19/verify-url-root/) and
[`verify-url-demo`](verification-evidence-19/verify-url-demo/) captures.

## Performance — PASS

Fresh throttled mobile Lighthouse:

| Metric | Result |
| --- | ---: |
| Performance | 90 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP | 0.98 s |
| LCP | 1.43 s |
| CLS | 0 |
| Initial transfer | 97,364 bytes |

Lighthouse does not provide lab INP. The separate interaction/browser suite
exercised the product controls without application errors.

Evidence: [`lighthouse-mobile.json`](verification-evidence-19/lighthouse-mobile.json).

## Android release — PASS for artifact integrity

The four live v0.5.12 download links resolve. `SHA256SUMS`, GitHub asset
digests, release provenance, embedded APK/AAB `build.json`, release notes, tag,
and candidate agree:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| APK | 5,589,035 | `ed96782a51f06c21129edca3ff94f811796a801f5d7d438672aac795d2ae272b` |
| AAB | 5,409,557 | `a217c32fbe6736006bef2b989a33ab9e60083b8d6c6190c008513575a37d8601` |

Both archives pass ZIP integrity. Running the release verifier against the
downloaded local files passes all artifact/provenance and packaged-demo
checks. Independent binary manifest parsing confirms package
`in.sociobot.apk_provenance_locker`, version `0.5.12`, version code 17,
launcher `in.sociobot.apk_provenance_locker.MainActivity`, min SDK 22, target
SDK 34, `allowBackup=false`, and only Internet plus the app-private dynamic
receiver permission. The APK has valid v1 and v2 signatures.

## Contract and copy review — PASS

The implemented product covers the brief's local verification, source URL,
hash, signature lineage, signer/downgrade warnings, optional saved copy,
encrypted export, later validation/import, and 20-app restoration set. It does
not distribute APKs or bypass platform controls. README, MIT license, privacy,
terms, demo documentation, design thesis, metadata, sitemap, robots, and 404
are present. Claim-like landing, policy, and README statements are mapped to
the claims manifest; no material unlisted claim was found. AI is not useful to
this cryptographic job, and no decorative AI feature is present.

## Defects

| Severity | Finding | Required correction |
| --- | --- | --- |
| **Critical / release-blocking** | The mandatory `release-assets` claim command exits 1 because `verify-release-candidate.mjs` requires mutable `origin/main` to equal the candidate exactly. The candidate is obtainable, tagged, deployed, and an ancestor of `main`; two later QA-only commits make equality impossible. | Make immutable release verification depend on candidate availability and exact tag/artifact provenance, not equality with the current mutable branch tip. If a branch relation is required, accept the candidate as an ancestor of `main`. Then rerun all 26 claim commands from a clean checkout. |

No product source was modified. This report, handoff update, and verification
evidence are the only changes.

**Final disposition: FAIL.**
