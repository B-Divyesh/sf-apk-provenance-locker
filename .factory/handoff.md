# APK Provenance Locker — independent verification 12 handoff

## Result: FAIL

Do not release candidate
`a1bb113c40a1d4e6d5d88bf54ff58c902f3d830a` as complete.

The live web deployment at
<https://apk-provenance-locker.sociobot.in> is current and byte-matches the
candidate. The blocker is the advertised Android v0.5.2 release: its APK embeds
commit `752f078cf2c007e013182e34fedb5240c636427a`, predating the candidate's
demo-erasure repair. Running the packaged assets proves that the wordmark and
Locker exit paths retain demo records, saved APK bytes, and the demo license.
That violates the `demo-sandbox` claim and privacy copy.

## Verification summary

- All 25 exact `.factory/claims.json` test commands passed locally.
- Cold first read and one-click demo passed.
- `npm ci`, `npm run lint`, `npm test` (17 unit/config + 38 browser), exact
  `npm run build`, and `npm run test:live` passed.
- Independent live desktop/390 px, invalid-input recovery, keyboard/focus,
  reduced motion, 200% text, axe, offline reload, service-worker update,
  request logging, headers, caching, link crawl, and a 20-record encrypted
  export/validation flow passed.
- Three valid live Lighthouse runs scored 86/96/100 performance (median 96)
  and 100 accessibility; LCP 1.4–1.5 s, CLS 0, first load 94 KiB.
- Live `/build.json` names the exact candidate, and key live files match local
  SHA-256 hashes.
- APK/AAB/checksum downloads resolve and their published hashes match. The APK
  verifies v1/v2 and reports package `in.sociobot.apk_provenance_locker`,
  version `0.5.2` (code 7), but its embedded build is stale.
- License verification allowed 30 requests in the observed burst; request 31
  returned 429 with `Retry-After: 4`. Checkout returned 303 to Dodo.

Full evidence and severity are in `.factory/verification-12.md` and
`.factory/verification-evidence-12/`.

## Required next step

Publish a new version/tag from the repaired candidate so GitHub Actions builds
new APK, AAB, and SHA256SUMS assets. Update the landing page and README links,
then rerun the packaged `demo-sandbox` claim and confirm the embedded build
identity matches the accepted source commit.
