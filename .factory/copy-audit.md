# Copy audit

Rechecked 2026-09-05 for repair work order 14. Counts use whitespace-delimited words;
hyphenated terms, URLs, paths, and filenames count as one word. No audited
sentence exceeds 22 words or uses a banned marketing word. **File fingerprint**
is the product term for the SHA-256 digest. **Signing history** is the product
term for certificate changes. **Source record** is the user-facing name for
`RELEASE_PROVENANCE.json`.

## Landing and demo

| Sentence or label | Words | Result |
| --- | ---: | --- |
| Local APK verification | 3 | Pass |
| Verify APKs before restoring | 4 | Pass |
| For Android users keeping APK files, this checks each app, version, signing history, and SHA-256 file fingerprint before a reinstall. | 20 | Declared claims: signature-verification, apk-identity, hash-check |
| Try it with sample data | 5 | Demo entry |
| Open two sample APK records. | 5 | Demo result |
| Verify an APK | 3 | Result-naming action |
| Verified on this device | 4 | Declared claim: signature-verification |
| Password-encrypted exports | 2 | Declared claim: encrypted-export |
| No sign-in or account | 4 | Declared claim: no-account-network |
| Your APK files are never uploaded. | 6 | Declared claim: apk-never-uploaded |
| Your verified APK records | 4 | Pass |
| Keep verified APK evidence | 4 | Pass |
| Export restore kit | 3 | Declared claim: encrypted-export |
| Validate a restore kit | 4 | Restore action |
| No APK evidence yet | 4 | Empty state |
| Verified APKs will appear here. | 5 | Empty-state explanation |
| Choose a file to check its signature, package name, and version. | 11 | Plain package/version wording |
| Verify your first APK | 4 | Result-naming action |
| Recheck file fingerprints, signatures, package names, versions, and signing history from saved APK copies. | 14 | Declared claims: restore-import, saved-apk-download |
| How the locker verifies evidence | 5 | Pass |
| Choose an APK. | 3 | Pass |
| The locker checks Android's v1, v2, and v3 signatures and creates a SHA-256 file fingerprint on this device. | 18 | Declared claims: hash-check, signature-verification |
| Read the package and version. | 5 | Pass |
| It reads the package name and version from the APK. | 10 | Declared claim: apk-identity |
| Check signer and downgrade risks. | 5 | Pass |
| Verified signing history and version codes reveal new certificates and incompatible downgrade risk. | 13 | Declared claims: signer-drift, downgrade-risk |
| Optional one-time purchase | 3 | Pass |
| Group APKs by device | 4 | Pass |
| Locker Plus costs $12 once. | 5 | Declared claims: paid-unlock, hosted-checkout |
| It adds private device labels for sorting a large locker. | 10 | Declared claim: paid-unlock |
| Verification, signer and downgrade warnings, and restore-kit export stay free. | 10 | Declared claim: free-core-features |
| Restore Locker Plus license | 4 | Result-naming action |
| Sociobot hosted checkout. | 3 | Declared claim: hosted-checkout |
| Android download | 2 | Pass |
| APK checks run on this device using Android's signature rules. | 10 | Declared claim: signature-verification |
| Android still makes the final install decision. | 7 | Limitation |
| v0.5.12 matches source `<release commit>`. | 4 | Declared claim: release-assets |
| Download APK from GitHub | 4 | Declared claim: release-assets |
| Download AAB from GitHub | 4 | Declared claim: release-assets |
| Download SHA256SUMS from GitHub | 4 | Declared claim: release-assets |
| Download source record from GitHub | 5 | Declared claim: release-assets |
| Use SHA256SUMS to check the files. | 6 | Declared claim: release-assets |
| Use the source record to confirm which repository commit built them. | 11 | Declared claim: release-assets |
| Download the APK, SHA256SUMS, and source record. | 8 | Declared claim: release-assets |
| Compare the APK's SHA-256 file fingerprint with the matching line in SHA256SUMS. | 12 | Declared claim: release-assets |
| Open RELEASE_PROVENANCE.json. | 1 | Filename after explanation |
| Confirm it names the repository commit shown above. | 8 | Declared claim: release-assets |
| Records and saved APK copies stay on this device. | 9 | Declared claim: local-storage |
| Demo — sample data, nothing is saved | 7 | Declared claim: demo-sandbox |
| Reset demo | 2 | Declared claim: demo-sandbox |
| Start for real | 3 | Declared claim: demo-sandbox |
| Check sample APK records | 4 | Demo heading |
| These two sample records show the evidence the locker keeps before a reinstall. | 13 | Declared claim: demo-sandbox |
| Use the sample locker | 4 | Demo heading |
| Open a record. | 3 | Pass |
| Read the package, version, signing history, and file fingerprint. | 9 | Pass |
| Verify an APK. | 3 | Pass |
| Choose your own file to check it on this device. | 10 | Declared claim: signature-verification |
| Reset the sample. | 3 | Pass |
| Start again without changing your real records. | 7 | Declared claim: demo-sandbox |

## README and policies

| Sentence or label | Words | Result |
| --- | ---: | --- |
| APK Provenance Locker verifies APK signatures, package names, versions, SHA-256 file fingerprints, and signing history before an Android reinstall. | 19 | Declared claims: signature-verification, apk-identity, hash-check |
| It is for people who keep lawful APK files and want an encrypted restore kit. | 15 | Declared claim: encrypted-export |
| The app verifies Android's v1, v2, and v3 signing formats on this device. | 13 | Declared claim: signature-verification |
| It checks signing history after an Android signing-key change and rejects files whose signed contents changed. | 16 | Declared claims: signer-drift, tamper-rejection |
| It reads the package name, version name, and version code from each APK. | 13 | Declared claim: apk-identity |
| Prior verified records reveal a new signing certificate and lower-version downgrade risk. | 12 | Declared claims: signer-drift, downgrade-risk |
| Use APK Provenance Locker | 4 | Heading |
| Try the isolated sample at /?demo=1 or /demo. | 8 | Declared claim: demo-sandbox |
| The demo keeps its records and files separate from your real locker. | 12 | Declared claim: demo-sandbox |
| Leaving, Reset demo, and Start for real erase demo data. | 10 | Declared claim: demo-sandbox |
| Develop and verify APK Provenance Locker | 6 | Heading |
| The release-assets command also downloads and checks the published APK, AAB, checksums, source record, tag, and release notes. | 18 | Release verification instruction |
| The production static site is written to dist/. | 8 | Build instruction |
| After a release is published, run npm run test:release. | 8 | Release verification instruction |
| It downloads the APK, AAB, checksums, and source record from GitHub. | 11 | Release verification instruction |
| It checks that the tag, release notes, source record, and both packages name the release's immutable source commit. | 18 | Release verification instruction |
| It also checks that Start for real, Locker, and the wordmark erase demo data. | 14 | Declared claim: demo-sandbox |
| Deploy APK Provenance Locker | 4 | Heading |
| Push the final candidate to origin/main before tagging it. | 9 | Release instruction |
| Run npm run test:candidate to prove GitHub can obtain that exact commit and main retains it. | 16 | Release instruction |
| Later QA documents may advance main. | 6 | Release instruction |
| Pushing the matching version tag runs the Android workflow. | 9 | Release instruction |
| It publishes APK, AAB, checksums, and source record. | 8 | Release instruction |
| These links use the fixed v0.5.12 release. | 7 | Declared claim: release-assets |
| Compare each file fingerprint with SHA256SUMS. | 6 | Declared claim: release-assets |
| Then use RELEASE_PROVENANCE.json, the source record, to confirm which repository commit built the files. | 13 | Declared claim: release-assets |
| Verification, signer and downgrade warnings, and restore-kit export stay free. | 10 | Declared claim: free-core-features |
| The page makes no automatic third-party requests. | 7 | Declared claim: no-account-network |
| Restore kits encrypt records in this browser with your password (PBKDF2-SHA256 and AES-GCM). | 13 | Declared claim: encrypted-export |

The first screen names the job, audience, and one-click sample path. It avoids
the earlier unexplained **identity**, **compiled manifest**, **provenance**, and
**immutable source commit** wording. The catalog sentence is “Check APK
signatures and record file fingerprints before reinstalling.” It has nine words,
starts with a verb, and is 70 characters including the final period.

## Terminology

| Concept | Product word |
| --- | --- |
| User-selected Android package archive | APK |
| Recorded package, version, source, signature, and fingerprint | evidence |
| SHA-256 digest for an APK | file fingerprint |
| Password-encrypted export file | restore kit |
| Optional stored APK bytes | saved APK copy |
| Checked certificate-change sequence | signing history |
| APK package/version fields | package name and version |
| Release-to-source mapping file | source record |
| Lower code than the newest record | downgrade risk |
