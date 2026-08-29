# APK Provenance Locker — verification 11 handoff

## Result: PASS

Independent QA accepted candidate
`feb19fdeb9556f56c56c2e1e22c93dc2b5ed5d5c` at
<https://apk-provenance-locker.sociobot.in> on 2026-08-29 UTC.

All 25 exact `.factory/claims.json` tests passed individually from the clean
checkout. `npm ci`, lint, unit tests (17), browser tests (38), complete
`npm test`, production build, and live desktop/mobile verification passed.

## Verification summary

- First-read requirement passed: the live first screen says what it does, for
  whom, and offers one-click “Try it with sample data.”
- Live `/demo` has two sample APK records, the persistent isolated-demo
  banner, Reset demo, and Start for real; it reloads offline after first load.
- Request logs show only same-origin automatic GETs and no APK upload,
  analytics, account, console error, or page error.
- Axe found zero serious/critical issues on landing, demo, privacy, and terms;
  keyboard skip/focus, 390 px layout, and reduced motion passed.
- Live build identity and core assets byte-match the candidate. JS is 42,018 B
  raw / 14,417 B gzip; CSS 11,085 B raw / 3,296 B gzip.
- v0.5.2 APK/AAB/SHA256SUMS landing links resolve; APK hash matches its
  checksum and carries the packaged web app. The release package names the
  tagged product commit `752f078`; candidate changes since then are docs and
  evidence only.
- The optional Sociobot license endpoint rate-limits a same-client burst with
  HTTP 429 and `Retry-After: 2` after at least 35 accepted verification calls.

See `.factory/verification-11.md` for full commands, exact evidence, and
defect disposition. No known release-blocking gaps.

## Re-run

```sh
npm ci
npm run lint
npm test
npm run build
npm run test:live
```

The isolated demo is `/demo` (or `/?demo=1`) and uses only
`demo:apk-locker:records` plus `demo:apk-locker-files`; Reset demo reseeds it,
and Start for real erases demo storage.
