# Copy audit

Checked 2026-08-29 for repair 9. Counts treat hyphenated terms, URLs,
paths, and filenames as one word. No audited sentence exceeds 22 words or uses
a banned marketing word. **File fingerprint** is the one product term for the
SHA-256 digest; the acronym appears only with that term or in `SHA256SUMS`.

## Landing and demo

| Sentence or label | Words | Result |
| --- | ---: | --- |
| Local APK verification | 3 | Pass |
| Verify APKs before restoring | 4 | Pass |
| For Android users keeping APK files, this checks each app, version, signing history, and SHA-256 file fingerprint before a reinstall. | 20 | Pass |
| Try it with sample data | 5 | Pass |
| Open two sample APK records. | 5 | Pass |
| Verified on this device | 4 | Declared claim: signature-verification |
| Password-encrypted exports | 2 | Declared claim: encrypted-export |
| No sign-in or account | 4 | Declared claim: no-account-network |
| Your APK files are never uploaded. | 6 | Declared claim: apk-never-uploaded |
| Check sample APK records | 4 | Pass |
| These two sample records show the evidence the locker keeps before a reinstall. | 13 | Declared claim: demo-sandbox |
| Your verified APK records | 4 | Pass |
| Keep verified APK evidence | 4 | Pass |
| Verify an APK | 3 | Pass |
| Export restore kit | 3 | Declared claim: encrypted-export |
| Validate a restore kit | 4 | Pass |
| Recheck file fingerprints, signatures, package identity, and signing history from saved APK copies. | 11 | Declared claims: restore-import, saved-apk-download |
| The locker checks Android's v1, v2, and v3 signatures and creates a SHA-256 file fingerprint on this device. | 18 | Declared claims: hash-check, signature-verification |
| Read the package and version. | 5 | Pass |
| Check signer and downgrade risks. | 5 | Pass |
| Locker Plus costs $12 once. | 5 | Declared claims: paid-unlock, hosted-checkout |
| APK checks run on this device using Android's signature rules. | 10 | Declared claim: signature-verification |
| Use the versioned SHA256SUMS file to check the APK's SHA-256 file fingerprint. | 12 | Declared claim: release-assets |
| Compare the APK's SHA-256 file fingerprint with the matching line in SHA256SUMS. | 12 | Declared claim: release-assets |
| Records and saved APK copies stay on this device. | 9 | Declared claim: local-storage |
| Demo — sample data, nothing is saved | 7 | Declared claim: demo-sandbox |
| Reset demo | 2 | Declared claim: demo-sandbox |
| Start for real | 3 | Declared claim: demo-sandbox |

## README, policies, and restore actions

| Sentence or label | Words | Result |
| --- | ---: | --- |
| APK Provenance Locker verifies APK signatures, identity, SHA-256 file fingerprints, and signing history before an Android reinstall. | 16 | Declared claims: signature-verification, apk-identity, hash-check |
| It is for people who keep lawful APK files and want an encrypted restore kit. | 15 | Declared claim: encrypted-export |
| The app verifies Android's v1, v2, and v3 signing formats on this device. | 13 | Declared claim: signature-verification |
| It checks signing history after an Android signing-key change and rejects files whose signed contents changed. | 16 | Declared claims: signer-drift, tamper-rejection |
| Use APK Provenance Locker | 4 | Pass |
| Try the isolated sample at /?demo=1 or /demo. | 8 | Declared claim: demo-sandbox |
| Leaving, Reset demo, and Start for real erase demo data. | 10 | Declared claim: demo-sandbox |
| APK checks run in the browser. | 6 | Declared claim: signature-verification |
| After the tag workflow publishes a release, npm run test:release downloads its APK, AAB, and checksums. | 15 | Release verification instruction |
| It checks their source identity and runs every demo-exit erasure path from the web assets inside the APK. | 18 | Release verification instruction |
| Compare its SHA-256 file fingerprint with the matching line in SHA256SUMS. | 11 | Declared claim: release-assets |
| Records and optional APK copies stay in browser or installed-app storage. | 11 | Declared claim: local-storage |
| Recording, checking, and exporting send no APK data or record content over the network. | 14 | Declared claim: apk-never-uploaded |
| Restore kits encrypt records in this browser with your password (PBKDF2-SHA256 and AES-GCM). | 13 | Declared claim: encrypted-export |

## Terminology

| Concept | Product word |
| --- | --- |
| User-selected Android package archive | APK |
| Recorded package, version, source, signature, and fingerprint | evidence |
| SHA-256 digest for an APK | file fingerprint |
| Password-encrypted export file | restore kit |
| Optional stored APK bytes | saved APK copy |
| Checked certificate-change sequence | signing history |
| Lower code than the newest record | downgrade risk |
