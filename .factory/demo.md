# Demo sandbox

Open `/demo` or `/?demo=1`. The demo starts with two realistic APK inventory
records: F-Droid and KeePassDX. Their hashes and certificate fingerprints are
sample metadata, not signature-verification results. The demo uses
`demo:apk-locker:records` and the separate `demo:apk-locker-files` IndexedDB
database. It never reads or writes the normal locker namespaces.

Use **Reset demo** in the persistent banner to discard demo edits and reseed
the two records. **Start for real** removes the demo key and opens the empty
real locker and deletes the demo file database. The app shell and the sample
metadata are precached after the first visit, so the demo is usable offline.
