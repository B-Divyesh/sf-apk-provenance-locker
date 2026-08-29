# Demo sandbox

Open `/demo` or `/?demo=1`. The demo starts with two realistic APK inventory
records: F-Droid and KeePassDX. Their package names, versions, hashes, and
signing-history fingerprints are sample metadata, not verification results. Use
**Verify an APK** with your own lawful file to run the local verifier. The demo uses
`demo:apk-locker:records` and the separate `demo:apk-locker-files` IndexedDB
database. It never reads or writes the normal locker namespaces.

The optional Locker Plus restore flow also works in the demo for safe testing.
It uses `demo:sb_license:apk-provenance-locker` and its matching verdict key,
never the real license namespace. **Start for real** deletes these demo-only
license values too.

Use **Reset demo** in the persistent banner to discard demo edits and reseed
the two records. **Start for real** removes the demo key and opens the empty
real locker and deletes the demo file database. The app shell and the sample
metadata and signature-verifier runtime are precached after the first visit,
so the demo and APK checks are usable offline.

After validating a restore kit, **Import verified records** writes only to the
current demo or real namespace. **Download verified APK** releases a matching
saved copy without importing it.
