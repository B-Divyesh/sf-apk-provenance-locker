# APK Provenance Locker

APK Provenance Locker verifies APK signatures, identity, hashes, and signer
history before an Android reinstall. It is for people who keep lawful APK
files and want an encrypted restoration record.

The app verifies v1/JAR, v2, and v3 signatures locally. It checks certificate
history after an Android signing-key change and rejects files whose signed
contents changed. It reads the
package name, version name, and version code from compiled `AndroidManifest.xml`.
Prior verified records reveal signer drift and lower-version downgrade risk.
Android still makes the final install decision.

## Use it

1. Open the app and choose **Verify an APK**.
2. Choose an APK you own and add its source URL.
3. Choose whether to keep an optional APK copy in local app storage.
4. Choose **Export restore kit** and set a password.
5. Later, choose **Validate a restore kit** to recheck saved copies against
   their hashes, signatures, package identity, and signers.

Try the isolated sample at `/demo`. Demo metadata and files use separate
`demo:` namespaces. **Reset demo** and **Start for real** erase the demo data.
Removing a real record erases its optional saved copy.

## Develop and verify

```sh
npm ci
npm run lint
npm test
npm run build
npx cap sync android
```

`npm test -- --grep @claim:<id>` runs each observable claim listed in
`.factory/claims.json`. The production static site is written to `dist/`.

Signature verification uses the self-hosted Apache-2.0 `apksig-go` v1.1.0
WebAssembly build. Its pinned adapter is in `tools/apksig-wasm`. Android apksig
fixtures and their exact checksums are in `tests/fixtures`.

## Android downloads

- [Download APK](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.4.0/app-release.apk)
- [Download AAB](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.4.0/app-release.aab)
- [Download SHA256SUMS](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.4.0/SHA256SUMS)

These links use the current `v0.4.0` release. A store release needs the owner's
upload key.

## Optional Locker Plus

Locker Plus costs $12 once. It adds private device labels for organizing a
large locker. Verification, warnings, and restore-kit export remain free.
Buy through Sociobot/Dodo, or use **Have a license? Paste it** to restore a
purchase on another device. Refunds are handled by the merchant of record.

## Privacy and license

Records and optional APK copies stay in browser or installed-app storage.
Recording, checking, and exporting send no APK data or record content over the
network. There are no analytics, advertising, or accounts. The free locker
makes no automatic third-party requests. Download links contact GitHub only
when selected. A saved Plus license is sent only to Sociobot for verification,
at most once each day.

Restore kits encrypt records in this browser with your password (PBKDF2-SHA256
and AES-GCM). The app does not store the export password. See `/privacy` and
`/terms`. The source is MIT licensed.
