# Copy audit

Checked 2026-08-29 after repair 7. Counts treat hyphenated terms, URLs,
and file names as one word. No audited sentence exceeds 22 words or uses a
banned marketing term.

## Landing and shared routes

| Sentence or label | Words | Result |
| --- | ---: | --- |
| Local APK verification | 3 | Pass |
| Verify APKs before restoring | 4 | Pass |
| For Android sideloaders who need verified package, version, signer, lineage, and hash evidence before a reinstall. | 16 | Pass |
| Try it with sample data | 5 | Pass |
| See a ready-to-check locker. | 5 | Pass |
| Verify an APK | 3 | Pass |
| Verified on this device | 4 | Pass |
| Password-encrypted exports | 2 | Pass |
| No sign-in or account | 4 | Pass |
| Your APK files are never uploaded. | 6 | Declared claim: apk-never-uploaded |
| Your verified APK records | 4 | Pass |
| Keep verified APK evidence | 4 | Pass |
| Export restore kit | 3 | Declared claim: encrypted-export |
| No APK evidence yet | 4 | Pass |
| Verified APKs will appear here. | 5 | Pass |
| Choose a file to check its signature and identity. | 9 | Pass |
| Verify your first APK | 4 | Pass |
| View full evidence | 3 | Pass |
| Recheck hashes, signatures, package identity, and signer lineage from saved APK copies. | 11 | Pass |
| How the locker verifies evidence | 5 | Pass |
| Choose an APK. | 3 | Pass |
| The locker checks v1, v2, and v3 signatures and hashes every byte on this device. | 15 | Declared claims: hash-check, signature-verification |
| Read the package and version. | 5 | Pass |
| It extracts the package name and version code from the compiled Android manifest. | 13 | Declared claim: apk-identity |
| Check signer and downgrade risks. | 5 | Pass |
| Verified signer lineage and version codes reveal signer changes and incompatible downgrade risk. | 13 | Declared claims: signer-drift, downgrade-risk |
| Optional one-time purchase | 3 | Pass |
| Group APKs by device | 4 | Pass |
| Locker Plus costs $12 once. | 5 | Declared claims: paid-unlock, hosted-checkout |
| It adds private device labels for sorting a large locker. | 10 | Declared claim: paid-unlock |
| Verification, warnings, and restore-kit export stay free. | 7 | Declared claim: paid-unlock |
| Buy Locker Plus — $12 | 5 | Declared claim: hosted-checkout |
| Have a license? Paste it | 5 | Declared claim: paid-unlock |
| One-time purchase. | 2 | Declared claims: paid-unlock, hosted-checkout |
| One-time purchase through Sociobot/Dodo. | 4 | Declared claim: hosted-checkout |
| Android download | 2 | Pass |
| The verifier runs locally with a pinned browser build of the Android-compatible apksig verifier. | 15 | Declared claims: offline-verification, apk-never-uploaded |
| Android still makes the final install decision. | 7 | Pass |
| Use the versioned SHA256SUMS file to check the APK's SHA-256. | 10 | Declared claim: release-assets |
| This app is not on Google Play yet. | 8 | Pass |
| Download the APK and its SHA256SUMS file. | 7 | Declared claim: release-assets |
| Compare the APK's SHA-256 with the matching line in SHA256SUMS. | 10 | Declared claim: release-assets |
| Allow installs from your browser or file manager when Android asks. | 11 | Pass |
| Open the APK. | 3 | Pass |
| Android shows the final install decision. | 6 | Pass |
| Records and saved APK copies stay on this device. | 9 | Declared claim: local-storage |
| Demo — sample data, nothing is saved | 7 | Declared claim: demo-sandbox |
| Reset demo | 2 | Declared claim: demo-sandbox |
| Start for real | 3 | Declared claim: demo-sandbox |

## README

| Sentence | Words | Result |
| --- | ---: | --- |
| APK Provenance Locker verifies APK signatures, identity, hashes, and signer history before an Android reinstall. | 15 | Pass |
| It is for people who keep lawful APK files and want an encrypted restoration record. | 15 | Pass |
| The app verifies v1/JAR, v2, and v3 signatures locally. | 10 | Declared claim: signature-verification |
| It checks certificate history after an Android signing-key change and rejects files whose signed contents changed. | 15 | Declared claims: signer-drift, tamper-rejection |
| It reads the package name, version name, and version code from compiled AndroidManifest.xml. | 13 | Declared claim: apk-identity |
| Prior verified records reveal signer drift and lower-version downgrade risk. | 9 | Declared claims: signer-drift, downgrade-risk |
| Android still makes the final install decision. | 7 | Pass |
| Open the app and choose Verify an APK. | 8 | Pass |
| Choose an APK you own and add its source URL. | 10 | Pass |
| Choose whether to keep an optional APK copy in local app storage. | 12 | Declared claim: local-storage |
| Choose Export restore kit and set a password. | 8 | Declared claim: encrypted-export |
| Later, choose Validate a restore kit to recheck saved copies against their hashes, signatures, package identity, and signers. | 18 | Pass |
| Try the isolated sample at /demo. | 5 | Pass |
| Demo metadata and files use separate demo: namespaces. | 7 | Declared claim: demo-sandbox |
| Reset demo and Start for real erase the demo data. | 10 | Declared claim: demo-sandbox |
| Removing a record first asks for confirmation. | 7 | Declared claim: saved-copy-erasure |
| Confirming it erases its optional saved copy. | 7 | Declared claim: saved-copy-erasure |
| These links use the current v0.5.0 release. | 8 | Declared claim: release-assets |
| Check the APK against its line in the versioned SHA256SUMS file. | 11 | Declared claim: release-assets |
| Android system backup is disabled for the app's private locker and license storage. | 13 | Declared claim: android-backup-disabled |
| Locker Plus costs $12 once. | 5 | Declared claims: paid-unlock, hosted-checkout |
| It adds private device labels for organizing a large locker. | 10 | Declared claim: paid-unlock |
| Verification, warnings, and restore-kit export remain free. | 7 | Declared claim: paid-unlock |
| Buy through Sociobot/Dodo, or use Have a license? Paste it to restore a purchase on another device. | 16 | Declared claims: paid-unlock, hosted-checkout |
| A refunded or revoked license stops private device labels. | 9 | Declared claim: revoked-license |
| Verification remains free. | 3 | Declared claim: paid-unlock |
| Records and optional APK copies stay in browser or installed-app storage. | 10 | Declared claim: local-storage |
| Recording, checking, and exporting send no APK data or record content over the network. | 13 | Declared claim: apk-never-uploaded |
| There are no analytics, advertising, or accounts. | 7 | Declared claim: no-account-network |
| The free locker makes no automatic third-party requests. | 8 | Declared claim: no-account-network |
| Download links contact GitHub only when selected. | 7 | Declared claim: release-assets |
| A saved Plus license is sent only to Sociobot for verification, at most once each day. | 15 | Declared claim: paid-unlock |
| Restore kits encrypt records in this browser with your password (PBKDF2-SHA256 and AES-GCM). | 12 | Declared claim: encrypted-export |
| The app does not store the export password. | 8 | Declared claim: password-not-stored |

## Privacy, Terms, and destructive confirmation

| Sentence or label | Words | Result |
| --- | ---: | --- |
| Android system backup is disabled for the app's private locker and license storage. | 13 | Declared claim: android-backup-disabled |
| After you confirm Remove, it erases the record and its saved copy. | 12 | Declared claim: saved-copy-erasure |
| A refunded or revoked license stops private device labels. | 9 | Declared claim: revoked-license |
| Remove `android.appsecurity.cts.tinyapp`? | 2 | Declared claim: saved-copy-erasure |
| This permanently erases this record and its saved APK copy from this device. | 13 | Declared claim: saved-copy-erasure |
| It cannot be undone. | 4 | Declared claim: saved-copy-erasure |
| Keep record | 2 | Pass |
| Remove record | 2 | Declared claim: saved-copy-erasure |

## Terminology

| Concept | Product word |
| --- | --- |
| User-selected Android package archive | APK |
| Collection of recorded facts | locker |
| Hash, source, signed identity, and signer history | evidence |
| Password-encrypted export file | restore kit |
| Optional stored APK bytes | saved copy |
| Cryptographically checked certificate history | signer lineage |
| Lower code than the newest record | downgrade risk |
