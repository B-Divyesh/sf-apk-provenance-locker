# APK Provenance Locker

APK Provenance Locker records APK hashes, sources, user-entered version notes,
and limited certificate evidence before an Android reinstall. It is for people
who already hold lawful APK files and want an encrypted restoration record.

The web app hashes every selected byte locally. It checks the ZIP directory for
`AndroidManifest.xml` and can read one embedded certificate fingerprint from a
v2 or v3 signing block. That fingerprint is unverified comparison evidence.

The web app does not cryptographically verify APK signatures. It does not read
v1 signer data, v3 signer lineage, or trusted package/version fields. Android
decides whether an APK can install or downgrade.

## Use it

1. Open the app and choose **Record an APK**.
2. Choose an APK you own. Enter a name, version note, and source you trust.
3. Choose whether to keep an optional APK copy in local app storage.
4. Choose **Export restore kit** and set a password.
5. Later, choose **Validate a restore kit** to check saved copies against their
   recorded hashes.

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

## Android downloads

- [Download APK](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.2.0/app-release.apk)
- [Download AAB](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.2.0/app-release.aab)
- [Download SHA256SUMS](https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/v0.2.0/SHA256SUMS)

The release workflow syncs the Capacitor 6 project, builds both packages, checks
their size, package id, manifest, and APK signature, then publishes checksums.
The release-specific test key supports direct sideloading. A store release needs
the owner's upload key. The app is not on Google Play.

## Privacy and license

Records and optional APK copies stay in browser or installed-app storage.
Recording, checking, and exporting send no APK data or record content over the
network. There are no analytics, advertising, account, or automatic third-party
requests. Download links contact GitHub only when selected.

Restore kits use PBKDF2-SHA256 and AES-GCM in the browser. The app does not store
the export password. See `/privacy` and `/terms`. The source is MIT licensed.
