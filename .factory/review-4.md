# Adversarial first-read review 4 — FAIL

Reviewed 2026-08-29 UTC. Live URL:
<https://apk-provenance-locker.sociobot.in>. Repository base:
`804b883a6f9dad54c60f97bf42d4a0bd15bbcd20`. The live `/build.json`
identifies `728decf811fe84104d57a778ad2edd85fd1eece8`; later commits contain
verification documents only, not product code.

## Verdict

**FAIL.** Five findings remain: one medium and four minor. All 25 registered
claim commands passed independently from a clean clone. No claim command was
skipped or failed. The failure is caused by one live entitlement statement
that is not represented by a claim and four README plain-language defects.

## Cold first read

Fresh 390 × 844 and 1440 × 900 browser contexts opened `/` with empty
storage. Before scrolling, all three required questions were answerable:

- What it does: verifies an APK's app/version, signing history, and SHA-256
  file fingerprint before a reinstall.
- For whom: Android users who keep APK files before reinstalling.
- What to click first: **Try it with sample data**.

The exact supporting copy was “Verify APKs before restoring,” “For Android
users keeping APK files, this checks each app, version, signing history, and
SHA-256 file fingerprint before a reinstall,” and “Try it with sample data.”
The adjacent outcome was “Open two sample APK records.” The three plain facts
were also visible without scrolling. Their container ended at y=763.77 in the
844 px mobile viewport and y=845.84 in the 900 px desktop viewport. There was
no horizontal overflow and no browser console error. This blocking gate
passes.

## Findings

### Medium

#### F-4-1 — The free warnings and export entitlement is an unlisted claim

**Location/quote:** Landing paid tier: “Verification, warnings, and
restore-kit export stay free.” The same promise appears in README as
“Verification, warnings, and restore-kit export remain free” and on `/terms`
as “Verification, safety warnings, and restore-kit export remain free.”

**Why:** `.factory/claims.json` declares that verification stays free after a
license is revoked. It does not declare that signer/downgrade warnings and
restore-kit export remain available without Locker Plus. The `paid-unlock`
test verifies license restoration and device labels; the `revoked-license`
test verifies only free signature verification. A visitor could rely on all
three named free entitlements when deciding whether to pay, so the other two
must not remain unlisted.

**Fix:** Add one claim such as “Verification, signer and downgrade warnings,
and restore-kit export work without a Locker Plus license.” Test it from a
fresh no-license demo by producing both warnings and exporting/decrypting a
kit. Alternatively narrow all three locations to the already tested sentence
“Verification stays free.”

### Minor

#### F-4-2 — The README heading “Develop and verify” lacks an object

**Location/quote:** README heading: “Develop and verify”.

**Why:** In a heading list, it does not say what is developed or verified.
The plain-words rule requires a heading to name its section without relying on
surrounding context.

**Fix:** “Develop and verify APK Provenance Locker”.

#### F-4-3 — The README heading “Deploy” lacks an object

**Location/quote:** README heading: “Deploy”.

**Why:** Heard out of context, it does not identify the product or artifact
being deployed.

**Fix:** “Deploy APK Provenance Locker”.

#### F-4-4 — The README explains demo isolation with storage jargon

**Location/quote:** “Demo metadata and files use separate `demo:`
namespaces.”

**Why:** “Namespaces” describes the implementation, not what a person can
expect. The useful fact is that trying the demo cannot read or change real
locker data.

**Fix:** “The demo keeps its records and files separate from your real
locker.” Keep the exact `demo:` key names in `.factory/demo.md` for
verifiers.

#### F-4-5 — The release-check sentence uses opaque internal terms

**Location/quote:** “It checks their source identity and runs every demo-exit
erasure path from the web assets inside the APK.”

**Why:** “Source identity” and “demo-exit erasure path” do not state the
observable checks. A maintainer cannot tell what must match or which exits are
covered without reading the test source.

**Fix:** “It confirms that both packages name this repository commit. It also
checks that Start for real, Locker, and the wordmark erase demo data.”

## Copy audit

Counts are whitespace-delimited; hyphenated terms, paths, URLs, and filenames
count as one word. Repeated labels are retained when they represent repeated
controls. No item exceeds 22 words and no banned marketing adjective appears.
F-4-1 is an unlisted claim; F-4-2 through F-4-5 are the remaining heading or
jargon flags. All buttons use result-naming verbs or the demo-contract labels
**Reset demo** and **Start for real**.

### Live landing page

| Sentence or label | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| APK Provenance Locker | 3 | Pass |
| Demo | 1 | Pass |
| Locker | 1 | Pass |
| Privacy | 1 | Pass |
| Local APK verification | 3 | Pass |
| Verify APKs before restoring | 4 | Pass |
| For Android users keeping APK files, this checks each app, version, signing history, and SHA-256 file fingerprint before a reinstall. | 20 | Pass |
| Try it with sample data | 5 | Pass |
| Open two sample APK records. | 5 | Pass |
| Verify an APK | 3 | Pass |
| Verified on this device | 4 | Pass |
| Password-encrypted exports | 2 | Pass |
| No sign-in or account | 4 | Pass |
| A paper-cut archive cabinet holding APK evidence parcels and certificate slips. | 11 | Pass — image alt text |
| Your APK files are never uploaded. | 6 | Pass |
| Your verified APK records | 4 | Pass |
| Keep verified APK evidence | 4 | Pass |
| Verify an APK | 3 | Pass |
| Export restore kit | 3 | Pass |
| No APK evidence yet | 4 | Pass |
| Verified APKs will appear here. | 5 | Pass |
| Choose a file to check its signature and identity. | 9 | Pass |
| Verify your first APK | 4 | Pass |
| How the locker verifies evidence | 5 | Pass |
| Choose an APK. | 3 | Pass |
| The locker checks Android's v1, v2, and v3 signatures and creates a SHA-256 file fingerprint on this device. | 18 | Pass |
| Read the package and version. | 5 | Pass |
| It extracts the package name and version code from the compiled Android manifest. | 13 | Pass |
| Check signer and downgrade risks. | 5 | Pass |
| Verified signing history and version codes reveal new certificates and incompatible downgrade risk. | 13 | Pass |
| Optional one-time purchase | 3 | Pass |
| Group APKs by device | 4 | Pass |
| Locker Plus costs $12 once. | 5 | Pass |
| It adds private device labels for sorting a large locker. | 10 | Pass |
| Verification, warnings, and restore-kit export stay free. | 7 | F-4-1 |
| The free locker is active. | 5 | Pass |
| Buy Locker Plus — $12 | 5 | Pass |
| Restore Locker Plus license | 4 | Pass |
| Sociobot hosted checkout. | 3 | Pass |
| Android download | 2 | Pass |
| APK checks run on this device using Android's signature rules. | 10 | Pass |
| Android still makes the final install decision. | 7 | Pass |
| Download APK from GitHub | 4 | Pass |
| Download AAB from GitHub | 4 | Pass |
| Download SHA256SUMS from GitHub | 4 | Pass |
| Use the versioned SHA256SUMS file to check the APK's SHA-256 file fingerprint. | 12 | Pass |
| Download the APK and its SHA256SUMS file. | 7 | Pass |
| Compare the APK's SHA-256 file fingerprint with the matching line in SHA256SUMS. | 12 | Pass |
| Allow installs from your browser or file manager when Android asks. | 11 | Pass |
| Open the APK. | 3 | Pass |
| Android shows the final install decision. | 6 | Pass |
| Records and saved APK copies stay on this device. | 9 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory · v0.5.3 | 6 | Pass |

### README

| Sentence or label | Words | Result |
| --- | ---: | --- |
| APK Provenance Locker | 3 | Pass |
| APK Provenance Locker verifies APK signatures, identity, SHA-256 file fingerprints, and signing history before an Android reinstall. | 17 | Pass |
| It is for people who keep lawful APK files and want an encrypted restore kit. | 15 | Pass |
| The app verifies Android's v1, v2, and v3 signing formats on this device. | 13 | Pass |
| It checks signing history after an Android signing-key change and rejects files whose signed contents changed. | 16 | Pass |
| It reads the package name, version name, and version code from compiled AndroidManifest.xml. | 13 | Pass |
| Prior verified records reveal a new signing certificate and lower-version downgrade risk. | 12 | Pass |
| Android still makes the final install decision. | 7 | Pass |
| Use APK Provenance Locker | 4 | Pass |
| Open the app and choose Verify an APK. | 8 | Pass |
| Choose an APK you own and add its source URL. | 10 | Pass |
| Choose whether to keep an optional APK copy in local app storage. | 12 | Pass |
| Choose Export restore kit and set a password. | 8 | Pass |
| Later, choose Validate a restore kit to check saved copies. | 10 | Pass |
| Import verified records or download a verified saved APK from the report. | 12 | Pass |
| Try the isolated sample at /?demo=1 or /demo. | 8 | Pass |
| Demo metadata and files use separate demo: namespaces. | 8 | F-4-4 |
| Leaving, Reset demo, and Start for real erase demo data. | 10 | Pass |
| Removing a record first asks for confirmation. | 7 | Pass |
| Confirming it erases its optional saved copy. | 7 | Pass |
| Develop and verify | 3 | F-4-2 |
| npm ci | 2 | Pass |
| npm run lint | 3 | Pass |
| npm test | 2 | Pass |
| npm run build | 3 | Pass |
| npx cap sync android | 4 | Pass |
| npm test -- --grep @claim:\<id\> runs each observable claim listed in .factory/claims.json. | 12 | Pass |
| The production static site is written to dist/. | 8 | Pass |
| After the tag workflow publishes a release, npm run test:release downloads its APK, AAB, and checksums. | 16 | Pass |
| It checks their source identity and runs every demo-exit erasure path from the web assets inside the APK. | 18 | F-4-5 |
| Deploy | 1 | F-4-3 |
| The factory deploys dist/ with the configured static work order. | 10 | Pass |
| Pushing a matching v\<version\> tag runs the Android release workflow and publishes APK, AAB, and checksum assets. | 17 | Pass |
| APK checks run in the browser. | 6 | Pass |
| Developers can inspect the pinned apksig-go v1.1.0 WebAssembly adapter in tools/apksig-wasm. | 11 | Pass — developer dependency detail |
| Android fixtures and their exact checksums are in tests/fixtures. | 9 | Pass |
| Android downloads | 2 | Pass |
| Download APK | 2 | Pass |
| Download AAB | 2 | Pass |
| Download SHA256SUMS | 2 | Pass |
| These links use the current v0.5.3 release. | 7 | Pass |
| Compare its SHA-256 file fingerprint with the matching line in SHA256SUMS. | 11 | Pass |
| Optional Locker Plus | 3 | Pass |
| Locker Plus costs $12 once. | 5 | Pass |
| It adds private device labels for organizing a large locker. | 10 | Pass |
| Verification, warnings, and restore-kit export remain free. | 7 | F-4-1 |
| Buy through Sociobot's hosted checkout, or use Restore Locker Plus license to restore a purchase on another device. | 18 | Pass |
| A refunded or revoked license stops private device labels. | 9 | Pass |
| Verification remains free. | 3 | Pass |
| Privacy and license | 3 | Pass |
| Records and optional APK copies stay in browser or installed-app storage. | 11 | Pass |
| Android system backup and device transfer are disabled for installed-app data. | 11 | Pass |
| Recording, checking, and exporting send no APK data or record content over the network. | 14 | Pass |
| There are no analytics, advertising, or accounts. | 7 | Pass |
| The free locker makes no automatic third-party requests. | 8 | Pass |
| Download links contact GitHub only when selected. | 7 | Pass |
| A saved Plus license is sent only to Sociobot for verification, at most once each day. | 16 | Pass |
| Restore kits encrypt records in this browser with your password (PBKDF2-SHA256 and AES-GCM). | 13 | Pass — outcome precedes algorithm detail |
| The app does not store the export password. | 8 | Pass |
| See /privacy and /terms. | 4 | Pass |
| The source is MIT licensed. | 5 | Pass |

### Terminology

| Concept | One product term | Result |
| --- | --- | --- |
| User-selected Android package archive | APK | Pass |
| Recorded package, version, source, signature, and fingerprint | evidence | Pass |
| SHA-256 digest for an APK | file fingerprint | Pass |
| Password-encrypted export file | restore kit | Pass |
| Optional stored APK bytes | saved APK copy | Pass |
| Checked certificate-change sequence | signing history | Pass |
| Lower code than the newest record | downgrade risk | Pass |

The catalog description is 77 characters, begins with the verb “Record,” and
contains no banned marketing word.

## Demo and sandbox behavior

| Check | Result |
| --- | --- |
| One-click entry | Pass: the landing action opened `/?demo=1`. |
| Product visible immediately | Pass: the first record began at y=638.39 in the 390 × 844 initial viewport. |
| Realistic sample | Pass: F-Droid 1.21.0 and KeePassDX 4.1.7 records were visible. |
| Persistent banner | Pass: “Demo — sample data, nothing is saved,” **Reset demo**, and **Start for real** were visible. |
| Reset | Pass: removal reduced the list from two records to one; Reset restored both records. |
| Real data untouched | Pass: `apk-locker:review4-sentinel` survived demo removal and Reset unchanged. The claim test separately covered real IndexedDB bytes. |
| Start for real cleanup | Pass: edited demo records were erased and the real sentinel remained. |
| Locker cleanup | Pass: edited demo records were erased, the URL became `/#locker`, the banner disappeared, and the real sentinel remained. |
| Wordmark cleanup | Pass: edited demo records were erased, the URL became `/`, the banner disappeared, and the real sentinel remained. |
| APK privacy log | Pass: live verification of `v1-only-rsa-2048.apk` made five same-origin GET requests, no request bodies, and no console/page errors. |
| Offline | Pass: `/demo` reloaded offline with both samples after one online visit; the dedicated offline signature check also passed. |

## Declared claims

A clean `--no-local` clone was created at
`/tmp/apk-review4-clean-U7fJH5/repo`, followed by `npm ci`. Every exact
`.factory/claims.json` command was then invoked separately. Each selected one
tagged browser test and exited zero.

| Claim ID | Exact command result |
| --- | --- |
| hash-check | Pass — 1 test |
| signature-verification | Pass — 1 test |
| v1-verification | Pass — 1 test |
| tamper-rejection | Pass — 1 test |
| lineage-integrity | Pass — 1 test |
| apk-identity | Pass — 1 test |
| downgrade-risk | Pass — 1 test |
| signer-drift | Pass — 1 test |
| apk-structure | Pass — 1 test |
| encrypted-export | Pass — 1 test |
| password-not-stored | Pass — 1 test |
| local-storage | Pass — 1 test |
| android-backup-disabled | Pass — 1 test |
| saved-copy-erasure | Pass — 1 test |
| demo-sandbox | Pass — 1 test |
| no-account-network | Pass — 1 test |
| apk-never-uploaded | Pass — 1 test |
| offline-reload | Pass — 1 test |
| offline-verification | Pass — 1 test |
| release-assets | Pass — 1 test |
| paid-unlock | Pass — 1 test |
| revoked-license | Pass — 1 test |
| hosted-checkout | Pass — 1 test |
| restore-import | Pass — 1 test |
| saved-apk-download | Pass — 1 test |

Each claim ID occurs in exactly one browser test. F-4-1 is not a failed
registered test; it is a claim-like live sentence for behavior outside every
registered claim.

The broader clean-clone gates also passed: `npm run lint`; `npm test` with 17
unit/config tests and 38 browser tests; and `npm run build`. The build produced
`dist/`; the initial JavaScript is 42,820 bytes raw and 14,770 bytes gzip.
`npm run test:live` passed at desktop and mobile with five same-origin GETs and
zero console errors in each verification flow. The factory URL verifier
reported a title, `lang=en`, one H1, one main, complete alt text and button
labels, and zero browser errors.

## Earlier-finding verification

All three earlier reviews, all three polish reports, and the cumulative
handoff were read. Every numbered finding was checked against current source
and live behavior.

| Earlier ID | Current independent confirmation |
| --- | --- |
| F-1-1 | Fixed: the live 404 has description, canonical, OG/Twitter metadata, theme, icons, one H1/main, and HTTP 404 status. |
| F-1-2 | Fixed: the live/source 404 has Demo, Locker, Privacy, Privacy/Terms, wordmark, and build identity. |
| F-1-3 | Fixed: live/source say “Local APK verification.” |
| F-1-4 | Fixed: live/source say “Your verified APK records.” |
| F-1-5 | Fixed: live/source say “Read the package and version.” |
| F-1-6 | Fixed: live/source say “Check signer and downgrade risks.” |
| F-1-7 | Fixed: the footer states that records and saved copies stay on this device. |
| F-1-8 | Fixed: generated-art provenance is absent from visitor copy and remains in design documentation. |
| F-1-9 | Fixed: the release-test-key assertion is absent from landing and README. |
| F-1-10 | Fixed after its earlier regression: Google Play copy is absent live, in source, and in README. |
| F-1-11 | Fixed: no current landing/README sentence exceeds 22 words. |
| F-1-12 | Fixed: the README uses the signing-key-change explanation. |
| F-1-13 | Fixed: the encryption outcome precedes algorithm names. |
| F-2-1 | Fixed: the first demo record intersects the initial mobile and desktop viewports. |
| F-2-2 | Fixed: merchant-of-record/refund-term assertions are absent; hosted-checkout wording has a passing claim. |
| F-2-3 | Fixed: the passing restore-import and saved-apk-download tests compare restored records and APK bytes. |
| F-2-4 | Fixed: the action says “Open two sample APK records.” |
| F-2-5 | Fixed: the audience sentence uses apps, versions, signing history, and file fingerprint. |
| F-2-6 | Fixed: the action is “Restore Locker Plus license.” |
| F-2-7 | Fixed: landing describes the device-local outcome; adapter detail is in the developer README section. |
| F-2-8 | Fixed: README uses “restore kit,” not “restoration record.” |
| F-2-9 | Fixed: README says “Use APK Provenance Locker.” |
| F-2-10 | Fixed: visitor copy consistently uses “signing history.” |
| F-2-11 | Fixed: upload-key and Google Play maintainer copy is absent. |
| F-3-1 | Fixed: live Start for real, Locker, and wordmark exits each erased edited demo records and retained real state. Source routes all three through `leaveDemo()`. |
| F-3-2 | Fixed: the digest is introduced as a SHA-256 file fingerprint and then called a file fingerprint. |

No earlier numbered finding regressed. F-4-1 through F-4-5 are new findings,
not recycled closure claims.

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
  the designed HTTP 404.
- All routes use the requested title pattern, `lang=en`, one H1, one main,
  description, canonical, OG/Twitter data, favicon, touch icon, and consistent
  header/footer navigation. The social image is 1200 × 630.
- Deep links reload correctly. Client navigation and browser back each focus
  the destination H1.
- Every landing link was crawled. Internal links returned 200; checkout
  returned the declared 303 to a Dodo session; APK, AAB, and SHA256SUMS links
  followed to 200. The two sample source sites also returned 200.
- Playwright axe scans found zero violations on `/`, `/demo`, `/privacy`,
  `/terms`, and the designed 404 at 390 px. No horizontal overflow occurred.
- The paper-cut archive art, clipped paper shapes, moss/pulp/orange palette,
  Georgia display face, and restrained paper-lift motion match
  `.factory/design.md`. The page does not present as a generic SaaS template.
- No AI feature is warranted for deterministic cryptographic verification.
  Verified restore-kit import and saved-APK download provide the obvious
  import/export leverage. Cloud sync would conflict with the local-first
  privacy model unless introduced as a separate, explicit opt-in product.

## What would make this perfect

Resolve F-4-1 by declaring and testing the complete free entitlement or by
narrowing the copy to the behavior already proved. Apply the four exact README
rewrites in F-4-2 through F-4-5. Then rerun all 25 claim commands, the full
suite/build, the live request log, the three demo exits, and this complete
copy/history/structure checklist. PASS is appropriate only when the finding
list is empty.
