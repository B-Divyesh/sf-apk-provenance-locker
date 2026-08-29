# Adversarial first-read review 3 — FAIL

Reviewed 2026-08-29 UTC. Live URL:
<https://apk-provenance-locker.sociobot.in>. Source base:
`1f6ffa249f8832d2386f6a72c5b3f1bbf2279ff3`.

## Verdict

**FAIL.** One blocking and one minor finding remain. All 25 exact claim
commands passed from a clean clone, but the live product contradicts the
declared `demo-sandbox` claim through a shared-header exit. No claim command
was skipped.

## Cold first read

Fresh 390 × 844 and 1440 × 900 contexts opened `/` with empty storage. Before
scrolling, all three required questions were answerable:

- What it does: verifies an APK's app/version, signing history, and file
  fingerprint before a reinstall.
- For whom: Android users who keep APK files before reinstalling.
- What to click first: **Try it with sample data**.

The exact supporting first-screen text was “Verify APKs before restoring,”
“For Android users keeping APK files, this checks each app, version, signing
history, and file fingerprint before a reinstall,” and “Try it with sample
data.” The adjacent explanation was “Open two sample APK records.” All three
facts ended at y=764 on mobile and y=846 on desktop. This gate passes.

## Findings

### Blocking

#### F-3-1 — The Locker header link leaves demo mode without erasing demo data

**Location/quote:** The persistent banner says “Demo — sample data, nothing is
saved.” The Privacy page says “Leaving or resetting the demo erases its
separate demo storage.” `.factory/claims.json` says “Demo data is separate and
erased when leaving demo mode.” On live `/demo`, the shared header's
**Locker** link points to `/#locker` and does not use the cleanup attached only
to **Start for real**.

**Evidence:** In a fresh live 390 px context, I removed F-Droid and waited
until `demo:apk-locker:records` contained only KeePassDX. I then selected the
header's **Locker** link. The browser opened `/#locker`, the demo banner was
gone, and `demo:apk-locker:records` still existed. Opening `/demo` again showed
only KeePassDX, proving the edit survived leaving demo mode. The wordmark has a
second route-state defect: selecting it from `/demo` changes the URL to `/`
while the demo banner and demo records remain visible.

**Why:** A visitor has two ordinary header routes out of the demo, but only
one named exit performs cleanup. This contradicts a declared privacy claim
and makes the URL, banner, and storage mode disagree. Demo isolation is a
blocking gate.

**Fix:** Route every transition from demo to a non-demo page through one
`leaveDemo()` function that deletes `demo:apk-locker:records`,
`demo:apk-locker-files`, and both demo license keys before navigation. Make
the wordmark and **Locker** either stay explicitly inside `/demo` or perform
that cleanup; do not render demo state at `/`. Extend `@claim:demo-sandbox`
to edit both localStorage and IndexedDB, then exit separately through **Start
for real**, **Locker**, and the wordmark. For each path, assert demo storage is
gone, real-storage sentinels are unchanged, the banner matches the URL, and a
fresh `/demo` reseeds both samples.

### Minor

#### F-3-2 — The same digest is called a fingerprint, hash, and SHA-256

**Location/quotes:** Landing: “file fingerprint,” “hashes every byte,” and
“check the APK's SHA-256.” README: “hashes” and “Check the APK against its
line in the versioned SHA256SUMS file.”

**Why:** These terms describe the same recorded digest, but the copy never
states that they are the same thing. A first-time APK keeper can read them as
separate checks. The plain-words rule requires one term for one concept.

**Fix:** Introduce it once as “SHA-256 file fingerprint,” then use “file
fingerprint” in visitor instructions. For example, replace “hashes every byte
on this device” with “creates a SHA-256 file fingerprint on this device,” and
replace the README's first “hashes” with “file fingerprints.” Keep the literal
filename `SHA256SUMS` where needed.

## Copy audit

Counts are whitespace-delimited. Hyphenated words, paths, filenames, and
version strings count as one word. Repeated Privacy/Terms navigation labels
are consolidated. No sentence exceeds 22 words and no banned marketing word
appears. All action controls name a result. F-3-2 is the only terminology
failure.

### Landing page

| Sentence or label | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| APK Provenance Locker | 3 | Pass |
| Demo | 1 | Pass |
| Locker | 1 | Pass |
| Privacy | 1 | Pass |
| Local APK verification | 3 | Pass |
| Verify APKs before restoring | 4 | Pass |
| For Android users keeping APK files, this checks each app, version, signing history, and file fingerprint before a reinstall. | 19 | F-3-2 |
| Try it with sample data | 5 | Pass |
| Open two sample APK records. | 5 | Pass |
| Verify an APK | 3 | Pass |
| Verified on this device | 4 | Pass |
| Password-encrypted exports | 2 | Pass |
| No sign-in or account | 4 | Pass |
| A paper-cut archive cabinet holding APK evidence parcels and certificate slips. | 11 | Pass |
| Your APK files are never uploaded. | 6 | Pass |
| Your verified APK records | 4 | Pass |
| Keep verified APK evidence | 4 | Pass |
| Export restore kit | 3 | Pass |
| No APK evidence yet | 4 | Pass |
| Verified APKs will appear here. | 5 | Pass |
| Choose a file to check its signature and identity. | 9 | Pass |
| Verify your first APK | 4 | Pass |
| How the locker verifies evidence | 5 | Pass |
| Choose an APK. | 3 | Pass |
| The locker checks Android's v1, v2, and v3 signatures and hashes every byte on this device. | 16 | F-3-2 |
| Read the package and version. | 5 | Pass |
| It extracts the package name and version code from the compiled Android manifest. | 13 | Pass |
| Check signer and downgrade risks. | 5 | Pass |
| Verified signing history and version codes reveal new certificates and incompatible downgrade risk. | 13 | Pass |
| Optional one-time purchase | 3 | Pass |
| Group APKs by device | 4 | Pass |
| Locker Plus costs $12 once. | 5 | Pass |
| It adds private device labels for sorting a large locker. | 10 | Pass |
| Verification, warnings, and restore-kit export stay free. | 7 | Pass |
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
| Use the versioned SHA256SUMS file to check the APK's SHA-256. | 10 | F-3-2 |
| Download the APK and its SHA256SUMS file. | 7 | Pass |
| Compare the APK's SHA-256 with the matching line in SHA256SUMS. | 10 | F-3-2 |
| Allow installs from your browser or file manager when Android asks. | 11 | Pass |
| Open the APK. | 3 | Pass |
| Android shows the final install decision. | 6 | Pass |
| Records and saved APK copies stay on this device. | 9 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory · v0.5.2 | 6 | Pass |

### README

| Sentence or label | Words | Result |
| --- | ---: | --- |
| APK Provenance Locker | 3 | Pass |
| APK Provenance Locker verifies APK signatures, identity, hashes, and signing history before an Android reinstall. | 15 | F-3-2 |
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
| Try the isolated sample at /demo. | 6 | Pass |
| Demo metadata and files use separate demo: namespaces. | 8 | Pass |
| Reset demo and Start for real erase the demo data. | 10 | Pass |
| Removing a record first asks for confirmation. | 7 | Pass |
| Confirming it erases its optional saved copy. | 7 | Pass |
| Develop and verify | 3 | Pass |
| npm ci | 2 | Pass |
| npm run lint | 3 | Pass |
| npm test | 2 | Pass |
| npm run build | 3 | Pass |
| npx cap sync android | 4 | Pass |
| npm test -- --grep @claim:\<id\> runs each observable claim listed in .factory/claims.json. | 12 | Pass |
| The production static site is written to dist/. | 8 | Pass |
| Deploy | 1 | Pass |
| The factory deploys dist/ with the configured static work order. | 10 | Pass |
| Pushing a matching v\<version\> tag runs the Android release workflow and publishes APK, AAB, and checksum assets. | 17 | Pass |
| APK checks run in the browser. | 6 | Pass |
| Developers can inspect the pinned apksig-go v1.1.0 WebAssembly adapter in tools/apksig-wasm. | 11 | Pass — developer detail |
| Android fixtures and their exact checksums are in tests/fixtures. | 9 | Pass |
| Android downloads | 2 | Pass |
| Download APK | 2 | Pass |
| Download AAB | 2 | Pass |
| Download SHA256SUMS | 2 | Pass |
| These links use the current v0.5.2 release. | 7 | Pass |
| Check the APK against its line in the versioned SHA256SUMS file. | 11 | F-3-2 |
| Optional Locker Plus | 3 | Pass |
| Locker Plus costs $12 once. | 5 | Pass |
| It adds private device labels for organizing a large locker. | 10 | Pass |
| Verification, warnings, and restore-kit export remain free. | 7 | Pass |
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
| Restore kits encrypt records in this browser with your password (PBKDF2-SHA256 and AES-GCM). | 13 | Pass |
| The app does not store the export password. | 8 | Pass |
| See /privacy and /terms. | 4 | Pass |
| The source is MIT licensed. | 5 | Pass |

### Terminology

| Concept | Current term | Result |
| --- | --- | --- |
| User-selected Android package archive | APK | Pass |
| Stored package/version/signature entry | APK record; its contents are evidence | Pass |
| Certificate-change sequence | signing history | Pass |
| Password-encrypted export | restore kit | Pass |
| Optional stored APK bytes | saved APK copy | Pass |
| File digest | file fingerprint / hash / SHA-256 | F-3-2 |
| Lower version-code warning | downgrade risk | Pass |

## Demo and sandbox behavior

| Check | Result |
| --- | --- |
| One-click entry | Pass: the first-screen action opened `/demo`. |
| Product visible immediately | Pass: the first record began at y=638 on 390 × 844 and y=490 on 1440 × 900. |
| Realistic sample | Pass: F-Droid 1.21.0 and KeePassDX 4.1.7 records were visible. |
| Persistent banner | Pass on `/demo`: banner, Reset demo, and Start for real were visible. |
| Reset | Pass: removal left one record; Reset restored both records. |
| Start for real cleanup | Pass: it removed the demo key/database and preserved a real localStorage record plus IndexedDB bytes `[7,8,9]`. |
| Locker header cleanup | **Fail: F-3-1.** It entered real mode but retained edited demo storage. |
| Wordmark route state | **Fail: F-3-1.** It displayed demo state and banner at `/`. |
| Network privacy | Pass: the landing, demo, reset, storage checks, and APK verification produced only same-origin GETs with no bodies. |
| Offline | Pass: after one online visit, live `/demo` reloaded offline with both records. |

## Declared claims

Each exact command in `.factory/claims.json` ran independently in clean clone
`/tmp/apk-review3-EZi7KI`. Each selected one tagged test and exited zero.

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
| demo-sandbox | Pass — 1 test, but misses the failing header exits in F-3-1 |
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

The live and README claim cross-check found no claim-like sentence lacking a
corresponding claim entry. F-3-1 is an observable counterexample to an entry,
not an unlisted claim.

The full clean-clone gates also passed: lint; 17 unit/config tests; 38 browser
tests; production build; and `npm run test:live` at desktop and 390 px. The
built JavaScript is 42.01 kB raw / 14.55 kB gzip. The factory URL verifier
reported one title, `lang=en`, one H1, one main, complete image alt text, no
unlabelled buttons, and no console errors on `/`.

## Earlier finding verification

Review 1, polish 1, review 2, polish 2, and the prior handoff were read in
full. Every numbered finding was checked against both current source and the
live site.

| Earlier ID | Current verification |
| --- | --- |
| F-1-1 | Fixed: live 404 has route title, description, canonical, OG/Twitter data, theme, and icons. |
| F-1-2 | Fixed: live/source 404 has the shared header, Demo/Locker/Privacy links, and Privacy/Terms footer. |
| F-1-3 | Fixed: “Local APK verification” remains live and in source. |
| F-1-4 | Fixed: “Your verified APK records” remains live and in source. |
| F-1-5 | Fixed: “Read the package and version” remains live and in source. |
| F-1-6 | Fixed: “Check signer and downgrade risks” remains live and in source. |
| F-1-7 | Fixed: the footer states that records and saved copies stay on this device. |
| F-1-8 | Fixed: generated-art provenance is absent from visitor copy. |
| F-1-9 | Fixed: the release-test-key claim is absent from landing and README. |
| F-1-10 | Fixed again: Google Play copy is absent live, in source, and in README. |
| F-1-11 | Fixed: no current landing/README sentence exceeds 22 words. |
| F-1-12 | Fixed: the README explains signing-key change with “signing history.” |
| F-1-13 | Fixed: the password-encryption outcome precedes algorithm names. |
| F-2-1 | Fixed: the first sample record intersects both initial demo viewports. |
| F-2-2 | Fixed: the unlisted merchant/refund assertions are absent; hosted checkout wording is tested. |
| F-2-3 | Fixed: validation offers tested record import and saved-APK download, including conflict choice. |
| F-2-4 | Fixed: the action explains “Open two sample APK records.” |
| F-2-5 | Fixed: the first-screen audience sentence uses Android users, apps, signing history, and file fingerprint. |
| F-2-6 | Fixed: the action is “Restore Locker Plus license.” |
| F-2-7 | Fixed: landing gives the outcome; adapter/WebAssembly detail is confined to developer README copy. |
| F-2-8 | Fixed: README uses “restore kit,” not “restoration record.” |
| F-2-9 | Fixed: the README heading is “Use APK Provenance Locker.” |
| F-2-10 | Fixed for signing terminology: visitor copy consistently uses “signing history.” |
| F-2-11 | Fixed: the upload-key/Google Play maintainer note is absent. |

No earlier numbered finding regressed. F-3-1 is a newly exercised exit path;
earlier reviews checked only **Start for real**.

## Structure, accessibility, links, and identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
  the designed 404.
- Titles follow the requested pattern and stay under 60 characters. Every
  route has `lang=en`, one H1, one main, description, canonical, OG/Twitter
  metadata, favicon, touch icon, and consistent header/footer links.
- Client navigation and browser back focus the new H1 after the route render.
  F-3-1 is the separate demo-mode route-state failure.
- Internal links return 200. Release links return 302 to GitHub release
  assets. Checkout returns the declared 303 to hosted checkout. The 404's own
  skip link correctly remains on its 404 document.
- Live Playwright axe scans found zero violations on `/`, `/demo`, `/privacy`,
  `/terms`, and the designed 404 at 390 px. No horizontal overflow was found.
- The paper-cut archive art, moss/pulp/orange palette, Georgia display type,
  clipped paper shapes, and restrained paper-lift motion match
  `.factory/design.md`; the site is not a generic SaaS template.
- No AI feature is warranted for deterministic cryptographic verification.
  Restore-kit import/download supplies the obvious missing leverage from the
  prior round. Cloud sync would conflict with the stated local-first job.

## What would make this perfect

Fix F-3-1 across every route out of demo and add the multi-exit sandbox
regression test. Standardize the digest term in F-3-2. Then rerun all 25 exact
claim commands, the complete suite/build, and the live storage test through
**Start for real**, **Locker**, and the wordmark. Nothing else remains from
this review.
