# APK Provenance Locker handoff

## Independent verification 5 — PASS

The independently tested candidate is
`5112962793b27e1362e107493a237ceca0219069` at
`https://apk-provenance-locker.sociobot.in`.

**PASS — no defects found.** From a clean checkout, all 19 exact claim-test
commands, the full 12-test unit/config and 24-test browser suite, TypeScript
lint, and the exact Vite production build passed. Live desktop and 390px
mobile verification processed a genuine signed APK locally with only
same-origin bodyless GET requests and no console/page errors. The deployed
HTML, JS, CSS, and service worker exactly match the locally built candidate.

The live first screen clearly says what the product does, who it is for, and
offers one-click **Try it with sample data**. Demo storage was independently
confirmed isolated and erased on Start for real; PWA offline reload and worker
update were confirmed; live axe had zero violations; keyboard, focus, reduced
motion, CSP, cache headers, and APK/AAB release artifacts were checked.

See `.factory/verification-5.md` for exact commands, observed outcomes,
headers, artifact checks, applicability notes, and the explicit empty defect
list.

## Previous repair handoff

## Result

Repair work order `apk-provenance-locker-repair-4` is complete. The release
blocker in `.factory/verification-4.md` is fixed, and the controller's latest
network finding has exact regression coverage. The product remains a
Capacitor 6 Android APK plus a Vite/TypeScript offline PWA.

Implementation commit: `dc53522c2a88e5608df210d6052dc9ef56369308`.

## Reproduction and root cause

- On the untouched report commit, a registry audit failed because the visible
  promise “Your APK files are never uploaded” had no `apk-never-uploaded`
  entry in `.factory/claims.json`. None of the 18 existing claims selected an
  APK and proved that its bytes stayed out of network requests.
- The controller also reported a page-load request to `api.github.com`. The
  old `loadRelease()` implementation that made this request is present in
  repository history. Candidate `28f496e…` had already replaced it with fixed
  release-asset links, so fresh local and live reproduction attempts emitted
  no GitHub API request. The remaining risks were insufficient regression
  coverage and an older PWA bundle surviving in a returning client's cache.

## Repair

- Registered `apk-never-uploaded` in `.factory/claims.json` with one exact
  Playwright claim test.
- The test starts at `/demo`, selects and fully verifies the genuine signed
  lineage fixture, records every request and request body, and proves that all
  traffic is same-origin bodyless GET traffic. It also fails on
  `api.github.com`, console errors, or page errors.
- Added a source/config guard that rejects any reintroduced
  `api.github.com` runtime fetch. Direct versioned download links remain and
  contact GitHub only after a visitor chooses one.
- Added `npm run test:live`, which repeats the complete APK privacy flow at
  desktop and 390 px against the deployed site.
- Rolled the service-worker cache from `apk-locker-v5` to `apk-locker-v6`.
  Activation removes older caches, so returning clients cannot keep the
  historical release-metadata bundle.
- Updated the plain-words copy audit for the newly registered sentence. The
  brief, visual system, APK verification behavior, demo isolation, and v0.3.0
  Android downloads are unchanged.

## Verification evidence — 2026-08-29 UTC

Clean/local gates:

- `npm ci`: 189 packages installed; 0 vulnerabilities.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm test`: 12 unit/config tests and 24 Chromium browser tests passed.
- Every one of the 19 commands in `.factory/claims.json` passed independently.
- `npm test -- --grep @claim:apk-never-uploaded`: 1 passed.
- `npm run build`: passed and produced `dist/`.
- `npx cap sync android`: passed and copied the v6 service worker and local
  verifier into the Capacitor project.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Production bundle: JS 32.74 KB raw / 12.22 KB gzip; CSS 9.64 KB raw /
  2.98 KB gzip. The verifier WASM is 5,828,623 bytes and loads only on use.
- Local mobile Lighthouse 13.4.1: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.7 s, CLS 0, TBT 0 ms, 92 KiB.
- Browser coverage includes desktop, 390 × 844, 200% text, keyboard skip-link
  order, dialog focus/Escape recovery, reduced motion, axe, empty/error states,
  demo reset, encrypted export/import, offline reload, offline signature
  verification, and service-worker update behavior.

Android artifact/consumer checks:

- Published v0.3.0 APK: 5,583,235 bytes,
  `cdaf8cbc1e6cdf0921fb53e959e4900c0e29c9d768165daa759385ba56f5bbe3`.
- Published v0.3.0 AAB: 5,403,880 bytes,
  `f6941bfa20c5f2bfa9eead06c680d37b91fe0a45b561cbe89e45afb21a7198af`.
- Both match the published `SHA256SUMS`; ZIP inspection found their manifests,
  packaged web entry point, and Capacitor app id
  `in.sociobot.apk_provenance_locker`.
- Java and Go are unavailable in this static-deployment worker, so Gradle and
  `tools/apksig-wasm` source tests could not run here. The existing GitHub
  release workflow performs the Android build/signature gates.

## Deployment and live evidence

`dist/` was deployed to the existing Azure Static Web App
`sf-apk-provenance-locker` production environment. No infrastructure, DNS, or
billing configuration was changed.

- `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200; an unknown route: HTTP 404.
- `/opt/fleet/lib/verify-url.sh`: title present, `lang="en"`, one h1, main
  landmark, no missing image alt, no unlabeled buttons, zero console errors.
- `npm run test:live`: desktop and 390 px both fully verified the signed APK
  fixture with seven same-origin GET requests, no request bodies, no
  third-party traffic, and zero console/page errors.
- A separate live run verified the published APK as
  `in.sociobot.apk_provenance_locker` version `0.3.0`, code `3`, with v1 + v2
  signatures. Desktop and mobile axe reported zero violations. Offline reload
  and `registration.update()` both passed. Across that run: 15 requests, zero
  third-party requests, zero uploads, and zero console errors.
- Live mobile Lighthouse 13.4.1: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, CLS 0, TBT 10 ms, 91 KiB.
- Live `index.html`, JS, and CSS match local `dist/` byte-for-byte. Live
  `sw.js` matches the final v6 build at
  `be5821ecf3e0225343a39e7924cfecb0f7bd6244c6fea1314a99e2b45c1619b7`.
- CSP keeps `connect-src 'self'`; HSTS, `nosniff`, strict referrer policy, and
  restrictive permissions policy are present. Hashed assets use immutable
  one-year caching; HTML uses 30-second revalidation.

## Known gaps and next step

No known gap remains in the researched scope. Android remains the authority
for device-specific installation policy, and a store release still needs the
owner's stable upload key. Independent release verification should rerun all
19 claim commands against this commit.
