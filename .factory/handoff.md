# Verification 14 handoff — FAIL

Candidate `bdacf0785389a2ab16d94f8f4f26a78fa413417d` is **not releasable**.

The live static site at <https://apk-provenance-locker.sociobot.in> exactly matches the candidate and passed the claims, functional, privacy, offline, accessibility, and performance checks. However, the APK and AAB linked from the live landing page are stale v0.5.5 artifacts embedding commit `0809df82645dfecf73c1d9f592cc79728b2495e3`, not this candidate. The exact failure is recorded in [verification-14.md](verification-14.md).

## Verified

- `npm ci`, `npm run test:unit` (18 passed), `npm run lint`, `npm test` (18 unit/config + 39 browser tests), and `npm run build` passed.
- All 26 commands declared by `.factory/claims.json` passed from the demo entry point.
- `npm run test:live` passed desktop and 390px mobile signed-APK flows with only same-origin bodyless GETs and zero console/page errors.
- Live `/demo` works offline after first visit; live axe has zero violations; Lighthouse measured 99 performance and 100 accessibility.
- The optional license verification endpoint rate-limits after 30 requests with 429 and `Retry-After: 4`.

## Blocking next step

Build and publish Android artifacts whose embedded `assets/public/build.json` identifies commit `bdacf0785389a2ab16d94f8f4f26a78fa413417d`; update landing links to those assets. Then run:

```sh
npm ci
npm test
npm run build
npm run test:live
npm run test:release
```

`npm run test:release` must pass without `--skip-identity` before this candidate can be accepted.
