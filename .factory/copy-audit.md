# Copy audit

Checked 2026-08-29 for polish round 2. Counts treat hyphenated terms, URLs,
and filenames as one word. No audited sentence exceeds 22 words or uses a
banned marketing term.

## Landing and demo

| Sentence or label | Words | Result |
| --- | ---: | --- |
| Local APK verification | 3 | Pass |
| Verify APKs before restoring | 4 | Pass |
| For Android users keeping APK files, this checks each app, version, signing history, and file fingerprint before a reinstall. | 18 | Pass |
| Try it with sample data | 5 | Pass |
| Open two sample APK records. | 5 | Pass |
| Verified on this device | 4 | Declared claim: signature-verification |
| Password-encrypted exports | 2 | Declared claim: encrypted-export |
| No sign-in or account | 4 | Declared claim: no-account-network |
| Your APK files are never uploaded. | 6 | Declared claim: apk-never-uploaded |
| Sample data | 2 | Pass |
| Check sample APK records | 4 | Pass |
| These two sample records show the evidence the locker keeps before a reinstall. | 13 | Declared claim: demo-sandbox |
| Your verified APK records | 4 | Pass |
| Keep verified APK evidence | 4 | Pass |
| Verify an APK | 3 | Pass |
| Export restore kit | 3 | Declared claim: encrypted-export |
| Validate a restore kit | 4 | Pass |
| Recheck hashes, signatures, package identity, and signing history from saved APK copies. | 11 | Declared claims: restore-import, saved-apk-download |
| The locker checks Android's v1, v2, and v3 signatures and hashes every byte on this device. | 16 | Declared claims: hash-check, signature-verification |
| Read the package and version. | 5 | Pass |
| It extracts the package name and version code from the compiled Android manifest. | 13 | Declared claim: apk-identity |
| Check signer and downgrade risks. | 5 | Pass |
| Verified signing history and version codes reveal new certificates and incompatible downgrade risk. | 13 | Declared claims: signer-drift, downgrade-risk |
| Locker Plus costs $12 once. | 5 | Declared claims: paid-unlock, hosted-checkout |
| Restore Locker Plus license | 4 | Declared claim: paid-unlock |
| Sociobot hosted checkout. | 3 | Declared claim: hosted-checkout |
| APK checks run on this device using Android's signature rules. | 10 | Declared claim: signature-verification |
| Android still makes the final install decision. | 7 | Pass |
| Use the versioned SHA256SUMS file to check the APK's SHA-256. | 10 | Declared claim: release-assets |
| Records and saved APK copies stay on this device. | 9 | Declared claim: local-storage |
| Demo — sample data, nothing is saved | 7 | Declared claim: demo-sandbox |
| Reset demo | 2 | Declared claim: demo-sandbox |
| Start for real | 3 | Declared claim: demo-sandbox |

## README, policies, and restore actions

| Sentence or label | Words | Result |
| --- | ---: | --- |
| APK Provenance Locker verifies APK signatures, identity, hashes, and signing history before an Android reinstall. | 15 | Declared claims: signature-verification, apk-identity, hash-check |
| It is for people who keep lawful APK files and want an encrypted restore kit. | 15 | Declared claim: encrypted-export |
| The app verifies Android's v1, v2, and v3 signing formats on this device. | 13 | Declared claim: signature-verification |
| It checks signing history after an Android signing-key change and rejects files whose signed contents changed. | 16 | Declared claims: signer-drift, tamper-rejection |
| Prior verified records reveal a new signing certificate and lower-version downgrade risk. | 12 | Declared claims: signer-drift, downgrade-risk |
| Use APK Provenance Locker | 4 | Pass |
| Later, choose Validate a restore kit to check saved copies. | 10 | Declared claim: encrypted-export |
| Import verified records or download a verified saved APK from the report. | 12 | Declared claims: restore-import, saved-apk-download |
| APK checks run in the browser. | 6 | Declared claim: signature-verification |
| The factory deploys dist with the configured static work order. | 10 | Deployment documentation |
| Pushing a matching v<version> tag runs the Android release workflow and publishes APK, AAB, and checksum assets. | 16 | Deployment documentation |
| Developers can inspect the pinned apksig-go v1.1.0 WebAssembly adapter in tools/apksig-wasm. | 10 | Developer documentation |
| Locker Plus uses Sociobot's hosted checkout. | 5 | Declared claim: hosted-checkout |
| A refunded or revoked license stops private device labels. | 9 | Declared claim: revoked-license |
| Matching saved copies are ready to import or download. | 9 | Declared claims: restore-import, saved-apk-download |
| Import verified records | 3 | Declared claim: restore-import |
| Download verified APK | 3 | Declared claim: saved-apk-download |
| Replace matching records | 3 | Restore conflict choice |

## Terminology

| Concept | Product word |
| --- | --- |
| User-selected Android package archive | APK |
| Recorded package, version, source, signature, and fingerprint | evidence |
| Password-encrypted export file | restore kit |
| Optional stored APK bytes | saved APK copy |
| Checked certificate-change sequence | signing history |
| Lower code than the newest record | downgrade risk |
