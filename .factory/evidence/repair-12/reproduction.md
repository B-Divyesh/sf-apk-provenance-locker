# Verification 17 identity failure reproduction

Reproduced on 2026-08-30 from the obtainable repair base
`76e414b95380bb6295acab6e3cb000b879238a11` before product changes.

```text
$ git fetch origin d7186184975c193d520d40a14b27fb552067e8ce
fatal: remote error: upload-pack: not our ref d7186184975c193d520d40a14b27fb552067e8ce
exit 128

$ npm run test:release -- --expected-commit d7186184975c193d520d40a14b27fb552067e8ce
Error: Release notes do not bind the immutable source commit
exit 1
```

The exact requested SHA differs from the available candidate after the seventh
character. GitHub's commit endpoint returned HTTP 422 for the requested SHA.
`origin/main`, `v0.5.11`, the live build, release notes, source record, APK, and
AAB instead named `d71861d6633f0e1d5c1d67e2ab1845a7f12e115f`.

After the repair, both candidate and full release preflights reject that same
SHA before downloading or building artifacts:

```text
$ npm run test:candidate -- --expected-commit d7186184975c193d520d40a14b27fb552067e8ce
Candidate d7186184975c193d520d40a14b27fb552067e8ce is not obtainable from origin.
Push the final candidate before building or publishing release artifacts.
exit 1
```

The regression also rejects a candidate that exists but is not the current
`origin/main`. `npm run test:candidate` passes only after the exact final
candidate is pushed.
