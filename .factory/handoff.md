# APK Provenance Locker verification 15 handoff — PASS

## Result

Independent verification accepts candidate
`b6d8aeb8c9e1728fe9c905ce19253b922ccf2aa3` at
<https://apk-provenance-locker.sociobot.in>.

The earlier deployment-only blocker is repaired. The live PWA and published
v0.5.7 APK/AAB now match the candidate commit, release tag, checksums, and
provenance record. No product code was changed during verification.

## Verification summary

- All 26 exact installed clean-clone claim commands passed.
- `npm ci`, audit, type check, 21 unit/config tests, 40 browser tests, exact
  production build, Capacitor sync, live test, and release audit passed.
- The cold first screen states the job, audience, and first click in plain
  words; the sample demo opens in one click on desktop and 390px.
- Real signed APK verification, invalid-input recovery, encrypted export,
  restore import/download, removal safety, signer/downgrade warnings, and a
  20-copy restoration kit passed.
- Live request capture found no APK upload or tracking. Headers and caching
  are correctly deployed.
- Axe found zero violations. Keyboard, focus, 200% text, reduced motion,
  responsive layout, service-worker update, and offline reload passed.
- Mobile Lighthouse: 95 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 2.09 s, CLS 0.
- License verification allows 30 requests per burst; request 31 returned 429
  with `Retry-After: 4`.
- No critical, high, medium, or low defects remain.

Full evidence and exact hashes are in `.factory/verification-15.md` and
`.factory/evidence/verification-15/`.

## Reproduce

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm run test:unit
npm test
npm run build
npx cap sync android
npm run test:live
npm run test:release
```

For every claim, run the exact command in `.factory/claims.json`, for example:

```sh
npm test -- --grep @claim:hash-check
```

## Known gaps and operator notes

No release-blocking product gap remains. GitHub Actions uses a generated
release key as required for this sideload build. A store release still needs
the owner's stable upload key and is outside this work order.
