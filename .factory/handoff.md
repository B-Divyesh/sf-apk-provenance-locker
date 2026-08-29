# Polish round 1 handoff — APK Provenance Locker

## Result

All 13 findings in `.factory/review-1.md` are resolved. There were no earlier
`.factory/review-*.md` or `.factory/polish-*.md` files. Earlier verification
reports were rechecked through the full functional, claim, privacy, offline,
accessibility, Android-sync, and live deployment suite.

Repair commit: `584112896d436a144f957321be625da4e0c7deda`.
Visual-evidence commit: `489d863760470b8ac70a077ba3059660ca41e4d0`.

## What changed

- Completed the standalone 404 metadata and shared navigation/footer.
- Rewrote every flagged landing and README sentence in plain language.
- Removed the artwork, release-key, and Google Play statements that were not
  product claims with observable sandbox tests.
- Added route metadata updates for Twitter titles/descriptions and 404 browser
  and source regression coverage.
- Updated the copy audit and the verb-first catalog description.

The existing local-first demo, separate `demo:` storage, full claim matrix,
real APK verification, routes, legal pages, PWA, and Android wrapper remain in
place and were exercised again.

## Verification

From fresh clone `/tmp/apk-provenance-locker-clean.95mxuW` after `npm ci`:

- Every exact command in `.factory/claims.json` passed independently: all 19
  `npm test -- --grep @claim:<id>` commands.
- `npm test` passed: 14 unit/config tests and 25 Chromium browser tests.
- `npm run lint` passed.
- `npm run build` passed and produced `dist/`.
- `npx cap sync android` passed.

Browser coverage includes the real demo isolation/reset path, signed APK
fixtures, privacy request logging, offline reload and verification, keyboard
focus, mobile 200% text, reduced motion, and axe scans. The new static-404 test
checks its metadata, favicon, canonical URL, normal navigation, and legal links.

Production build sizes: JavaScript 32,807 B raw / 12,160 B gzip; CSS 9,645 B
raw / 2,980 B gzip; hero WebP 75,842 B.

## Deployment and live recheck

Deployed `dist/` with `/opt/fleet/lib/deploy-static.sh` to
https://apk-provenance-locker.sociobot.in. Azure deployment ID:
`7611c7cb-d444-4ab7-bf15-79e8fd0703e9`.

- `/opt/fleet/lib/verify-url.sh` passed for the cold landing URL: 651 ms load,
  no page/application console errors, `lang=en`, one h1, main landmark, and no
  missing image alt text or unlabeled buttons.
- `npm run test:live` passed: desktop and mobile `/demo` both verified a real
  v1/v2/v3 APK using seven same-origin GET requests and zero errors.
- Live axe scans passed with zero violations for `/`, `/demo`, `/privacy`,
  `/terms`, and `/not-a-real-route`. The unknown route returns HTTP 404 with
  complete metadata and normal navigation. Browser developer tools naturally
  report the document's expected 404 response; there were no application
  console or page errors.
- Live mobile Lighthouse on `/demo`: Performance 98, Accessibility 100, Best
  Practices 100, and SEO 100; FCP 1.9 s, LCP 1.9 s, CLS 0. Chromium reported a
  screenshot-teardown crash after it wrote the otherwise complete JSON report.
- The live first screen contains all revised concrete wording and none of the
  removed phrases. All F-1-1 through F-1-13 were checked directly.

Evidence:

- `.factory/evidence/live/screenshot-desktop.png`
- `.factory/evidence/live/screenshot-mobile.png`
- `.factory/evidence/live/verify.json`
- `.factory/evidence/live/lighthouse.json`
- `.factory/evidence/demo-mobile.png`
- `.factory/evidence/404-mobile.png`

## Run locally

```sh
npm ci
npm test
npm run lint
npm run build
npx cap sync android
```

## Known gaps

None. Google Play publishing and an owner upload key remain separate product
distribution work, not a defect in this direct-download APK release.
