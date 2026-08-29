# APK Provenance Locker — polish round 3 handoff

## Result: PASS

Repair commit: `e4d1f4eafb9e09b80a9a9a64af42b454505da88f`.
Deployment: `cd211bd3-ab63-4098-88ff-3901de5206f5`.
Live site: <https://apk-provenance-locker.sociobot.in>.

This repair closes every finding in review rounds 1–3. The important behavior
change is a route-aware, isolated demo lifecycle: the first-screen action
opens `/?demo=1`, shows sample records and the persistent banner immediately,
and Start for real, Locker, wordmark, Reset demo, and non-demo boot clean demo
records, files, and demo license storage without changing real storage.

It also standardizes the digest wording as “SHA-256 file fingerprint” and
uses “file fingerprint” thereafter. Metadata, legal links, 404 shell, focus,
mobile layout, offline cache version, claims, README, demo documentation, and
the catalog description remain complete and have been rechecked.

## How to run and verify

```sh
npm ci
npm run lint
npm test
npm run build
npx cap sync android
```

Open `/?demo=1` for the isolated one-click sample, or `/demo` for its canonical
route. The full claim contract is in `.factory/claims.json`; run any one with
`npm test -- --grep @claim:<id>`.

## Exact evidence

- Clean clone: `/tmp/apk-provenance-polish3-DKnwWi`.
  `npm ci`, `npm run lint`, all 25 separately invoked exact claim commands,
  `npm test` (17 unit/config + 38 browser), `npm run build`, and
  `npx cap sync android` passed.
- `@claim:demo-sandbox` now proves cleanup through Start for real, Locker, and
  the wordmark after writing demo records, IndexedDB bytes, and a demo license.
  It also proves real localStorage and IndexedDB sentinels survive and `/demo`
  reseeds both samples.
- Local quality evidence: `.factory/evidence/polish-3/local/verify.json`,
  `lighthouse.json` (performance 100, accessibility 100, SEO 100),
  `demo-query-mobile.png`, and `404-mobile.png`. The production JavaScript is
  42,820 bytes raw / 14,770 bytes gzip.
- Live quality evidence: `.factory/evidence/polish-3/live/verify.json`,
  `route-recheck.json`, `demo-query-mobile.png`, `404-mobile.png`, and
  desktop/mobile screenshots. `verify-url.sh`, `npm run test:live`, live axe,
  route metadata, no-overflow, direct `?demo=1`, and all three live demo exits
  passed. Live `/build.json` identifies `e4d1f4e`.
- Full review mapping is in `.factory/polish-3.md`.

## Known gaps and next steps

None. The existing GitHub Actions workflow remains the Android APK/AAB release
path; static deployment is current. A future version/tag can produce the next
Android release asset when product changes require it.
