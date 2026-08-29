# Verifier 14 reproduction

Run after a clean `npm ci` against the reported v0.5.5 release:

```text
$ npm run test:release -- --expected-commit bdacf0785389a2ab16d94f8f4f26a78fa413417d
Error: APK commit is 0809df82645dfecf73c1d9f592cc79728b2495e3;
expected bdacf0785389a2ab16d94f8f4f26a78fa413417d
```

This reproduces the release-blocking stale-binary provenance failure before
the v0.5.6 repair.
