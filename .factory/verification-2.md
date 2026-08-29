# Independent product verification — FAIL

**Candidate:** `4f477352bc21bd77cb7078a15a4f4ba04bcddc03`  
**Live URL:** <https://apk-provenance-locker.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Result:** **FAIL — do not release**

This is an independent fresh verification after the earlier report in
`.factory/verification.md`. The live `index.html`, JS, and CSS SHA-256 values
match the fresh local build exactly, so the results apply to this candidate:

| File | SHA-256 |
| --- | --- |
| `index.html` | `e86e55c50211ff300d7dc5107247b77c65776409f3b18a7577c3e2e1f77d8484` |
| `assets/index-DTL--ikZ.js` | `8b6edf516dc59813d72a3dc158da50fcca12407a8dbc8ba5e179f25a5fb9ea5c` |
| `assets/style-CZ41LGKN.css` | `3821041e70b5a7da4ab9555fb26d8432d292c25e8fb30a62dacb0a261275cee7` |

## Opening gates

### Claim commands: commands pass, but the claim contract still fails

After `npm ci`, every exact command listed in `.factory/claims.json` passed
against the demo entry point:

| Claim | Exact command | Result |
| --- | --- | --- |
| encrypted export | `npm test -- --grep @claim:encrypted-export` | PASS (1 Playwright test) |
| local byte hash | `npm test -- --grep @claim:hash-check` | PASS (1 Playwright test) |
| demo isolation | `npm test -- --grep @claim:demo-sandbox` | PASS (1 Playwright test) |
| local storage | `npm test -- --grep @claim:local-storage` | PASS (1 Playwright test) |
| malformed APK rejection | `npm test -- --grep @claim:apk-structure` | PASS (1 Playwright test) |
| offline demo reload | `npm test -- --grep @claim:offline-reload` | PASS (1 Playwright test) |

They do not prove several promised observable outcomes, so the claims gate is
not substantively satisfied. In particular, the hash test only asserts that a
card contains the words `SHA-256`, not the digest of its fixed bytes; the export
test only asserts a `.locker` filename and dialog closure, not that plaintext
record names are absent or that the supplied password opens the download. The
landing page's testable “No account required” and the README/privacy claims that
the password is never stored and saved copies are erased have no claim entries.
The claims policy requires those tests or removal of the claims.

### Cold first read: PASS

Fresh desktop and 390 px browser contexts show: “Keep APK restore evidence”; it
identifies Android sideloaders; and “Try it with sample data” says “See a
ready-to-check locker.” One click opens `/demo` with two believable inventory
records and the persistent “Demo — sample data, nothing is saved” banner.

## Release-blocking defects

### Critical

1. **No Android APK/AAB release exists.** `GET
   https://api.github.com/repos/B-Divyesh/sf-apk-provenance-locker/releases/latest`
   returned HTTP 404 on 2026-08-29. The live app therefore displays “Android
   release is being published” and emits a browser console error on `/` and
   `/demo`. No APK, AAB, or `SHA256SUMS` can be downloaded, unpacked, checked
   for `in.sociobot.apk_provenance_locker`, or installed. This fails the
   `android-apk` delivery contract.

2. **The central provenance check in the researched brief is absent.** The
   implementation only validates a ZIP container and the presence of
   `AndroidManifest.xml`; it hashes chosen bytes and reads selected v2/v3
   signing-block bytes. It has no v1 support, no APK cryptographic signature
   verification, no v3 signer-lineage parsing, and no signer-chain validation.
   The app also takes app name/version/source from user fields rather than the
   APK and performs only a numeric comparison of those user-entered versions.
   It cannot reliably warn of an incompatible downgrade or identify every
   unexpected signer change as the brief requires.

### High

1. **The deployment fails the no-console-errors quality gate.** Every cold
   landing and demo load requested the missing GitHub release endpoint and
   logged `Failed to load resource: the server responded with a status of 404`.
   This is an external request in demo mode as well.

2. **Claim coverage is inadequate despite green command exits.** The missing
   and weak assertions described above are release-blocking under the supplied
   claims contract: a visible statement may not be retained unless its sandbox
   test proves the stated result.

### Medium

1. **The required 404 response is not live.** A request to
   `/this-route-does-not-exist` returns HTTP 200 and the landing HTML, rather
   than the designed `404.html` / HTTP 404 specified by `staticwebapp.config`.

2. **Keyboard start position is wrong on the landing page.** Initial rendering
   programmatically focuses the `h1`. A first `Tab` lands on “Try it with
   sample data,” skipping the skip link and header navigation in normal forward
   tab order. The skip link itself works when reached and has a visible 3 px
   focus ring, but it is not the first keyboard destination.

3. **The deployed manifest has the wrong MIME type.** `/manifest.webmanifest`
   is served as `application/octet-stream`, not
   `application/manifest+json`, despite the local static configuration.

## What passed

- Clean install: `npm ci` completed (188 packages); `npm audit --omit=dev`
  found 0 vulnerabilities.
- `npm test` passed: 6 Vitest tests and 8 Playwright tests.
- `npm run lint` passed (`tsc --noEmit`); `npm run build` passed and produced
  `dist/`.
- `npx cap copy android` passed (with Capacitor's deprecated
  `bundledWebRuntime` warning). This worker has no `java` executable, so a
  local Gradle build was unavailable; this does not alter the independently
  confirmed absence of the public release artifact.
- Demo end-to-end on the live site: two seeded records; a structural sample
  APK recorded; a lower `1.0` user version after `2.0` displayed the downgrade
  warning; encrypted export downloaded; its correct password produced “2
  hashes match.” A wrong password showed “That password did not open this
  restore kit” and recovered with the correct password. Required file input
  reports invalid before selection, and a non-ZIP APK is rejected by the claim
  test.
- PWA: after a first `/demo` visit the page was service-worker controlled;
  offline reload retained the `h1` and two sample records.
- Accessibility: Playwright axe 4.13 reported zero violations, including zero
  serious/critical findings, on `/`, `/demo`, `/privacy`, and `/terms` at
  390×844. Each has `lang=en`, exactly one `h1`, and one `main`; no horizontal
  overflow was observed. Reduced-motion emulation found no nonzero animations
  or transitions. Header/footer nav targets measured at least 44 px high.
- Privacy/network: no analytics, adverts, third-party scripts, or web fonts
  were requested. The app did request `api.github.com` for release metadata;
  that is disclosed on Privacy but currently 404s. There are no product
  server-side endpoints or sign-in flow, so request-rate allowance and Entra
  tenant checks are not applicable.
- Headers: live documents/assets use HSTS, CSP with `frame-ancestors 'none'`,
  `nosniff`, strict-origin referrer policy, and permissions policy. Hashed JS
  and CSS use `max-age=31536000, immutable`; the first-load JS is 21,461 B raw
  / 7,950 B gzip, CSS is 9,149 B raw / 2,870 B gzip, and hero WebP is 75,842 B.
- Lighthouse 12.8.2 generated a partial report before its browser tab crashed:
  performance 97, accessibility 100, best practices 96, SEO 92; FCP 0.9 s,
  LCP 1.3 s, CLS 0, TBT 200 ms. Treat these as indicative rather than a clean
  completed Lighthouse run because of that tool crash.

## Required disposition

Do not release. Publish and verify a real Android APK/AAB plus checksum; make
the landing release check stop producing a console error; implement genuine APK
signature verification (v1, v2, v3 lineage) and package/version-based downgrade
safety, or narrow the product and researched promises honestly; make every
claim test prove its stated observable result and add the missing claim tests;
then repair the live 404/MIME/initial keyboard-focus defects and repeat this
verification from a clean checkout.
