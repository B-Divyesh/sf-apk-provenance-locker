# APK Provenance Locker review 5 handoff — FAIL

## Result

Independent adversarial review 5 evaluated source
`b2b37d9b447ff68adaa341a6dcab2e15dcabd244` and the live product. No product
code was changed. The result is **FAIL** with six findings: two blocking, two
medium, and two minor.

The blocking defects are broken route scroll/Back restoration and regression
of earlier finding F-1-11: the README again contains a 23-word release-workflow
sentence. The complete evidence and proposed fixes are in
`.factory/review-5.md`.

## Verification performed

- Opened the live product cold at 390 × 844 and 1440 × 900.
- Exercised the one-click demo, Reset, all three demo exits, real-storage
  isolation, live APK verification, request logging, and offline reload.
- Ran all 26 exact `.factory/claims.json` commands independently from no-local
  clone `/tmp/apk-review5-clean-Pcfqmf/repo`; all passed.
- Ran `npm run lint`, `npm test` (21 unit/config and 40 browser tests), and
  `npm run build`; all passed and `dist/` was produced.
- Crawled product, release, sample-source, and checkout links.
- Checked metadata, titles, H1/main counts, designed 404, deep links, browser
  Back behavior, axe, reduced-motion coverage, and 200% text reflow.
- Read every prior review, polish report, and handoff; rechecked every numbered
  finding against live behavior and source.

Screenshots are in `.factory/review-5-evidence/`.

## Work left

Repair F-5-1 and F-1-11 first. Then register or remove the package-size and
release-fallback claims, and apply the two copy rewrites. Rerun the entire
review checklist from scratch; do not treat the green declared-claim suite as
acceptance while unlisted claims and review findings remain.
