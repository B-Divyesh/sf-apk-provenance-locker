# APK Provenance Locker repair 10 handoff — PASS

## Result

The verifier 14 release blocker is repaired in v0.5.7. The GitHub release tag,
release notes, checksums, provenance record, APK, and AAB now bind to one
immutable source commit. The landing page reads the latest metadata from
`api.github.com` and keeps versioned v0.5.7 links usable when that request
fails.

The release candidate is the commit resolved by `git rev-list -n 1 v0.5.7`.
The deployed web build publishes the same value in `/build.json`. Both Android
packages publish it in their bundled `assets/public/build.json`.

## Reproduction and repair

Before the repair, this verifier command failed exactly as reported:

```text
npm run test:release -- --expected-commit bdacf0785389a2ab16d94f8f4f26a78fa413417d
Error: APK commit is 0809df82645dfecf73c1d9f592cc79728b2495e3;
expected bdacf0785389a2ab16d94f8f4f26a78fa413417d
```

The root cause was a v0.5.5 release built before the candidate while static
landing links continued to identify it as current. The repair:

- bumps the web and Android package to v0.5.7 / version code 12;
- rejects GitHub metadata unless its tag, four assets, and release notes match
  the current build commit;
- retains deterministic versioned links as the no-network fallback;
- skips the metadata request while offline, avoiding a console network error;
- generates `RELEASE_PROVENANCE.json` from the built APK and AAB;
- verifies checksums, provenance fields, tag target, release notes, and both
  embedded `build.json` files;
- redownloads the public assets after publication and reruns that identity
  test inside the release workflow.

The exact stale-commit condition, missing provenance, undersized packages,
successful API metadata, and API failure fallback all have regression tests.

## Verification evidence

- Clean `npm ci`: 189 packages; `npm audit --audit-level=high`: zero
  vulnerabilities.
- `npm run lint`: passed.
- `npm run test:unit`: 21/21 passed.
- `npm test`: 21 unit/config and 40 browser tests passed.
- All 26 exact `.factory/claims.json` commands passed independently.
- `npm run build`: JS 45,620 bytes / 15.72 KiB gzip; CSS 11,085 bytes /
  3.29 KiB gzip. `dist/` was produced.
- `npx cap sync android`: passed.
- `/opt/fleet/lib/verify-url.sh` passed local `/` and `/demo`: one h1, one
  main, `lang=en`, no missing alt text, no unlabeled buttons, and no console
  errors. Desktop and 390px screenshots are in `.factory/evidence/repair-10/`.
- Local mobile Lighthouse: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 1.1 s, LCP 1.3 s, CLS 0, TBT 30 ms.
- Browser coverage passed at 1440px and 390px, 200% text, keyboard-only dialog
  use, reduced motion, axe, service-worker update cleanup, and offline reload
  and signature verification.
- Privacy coverage allows only same-origin bodyless GETs plus one bodyless
  GitHub public-metadata GET. APK bytes and locker data are never requested.
- The release workflow builds on GitHub Actions with JDK 17, validates the
  package id, Android backup exclusions, signature, packaged web bytes, and
  demo isolation before publishing. It then redownloads all four public assets
  for the immutable identity check.

## Run and verify

```sh
npm ci
npm audit --audit-level=high
npm run lint
npm test
npm run build
npx cap sync android
npm run test:live
npm run test:release
```

Release: <https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/tag/v0.5.7>

Live site: <https://apk-provenance-locker.sociobot.in>

## Known gaps and next steps

No release-blocking product gap remains. GitHub Actions signs this sideload
release with a workflow-generated key, as required by the work order. A store
release still needs the owner's stable upload key and is separate work.
