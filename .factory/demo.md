# Demo sandbox

Open `/demo` or `/?demo=1`. The demo starts with two realistic APK inventory
records: F-Droid and KeePassDX. Its only browser storage key is
`demo:apk-locker:records`; it never reads or writes the normal locker key.

Use **Reset demo** in the persistent banner to discard demo edits and reseed
the two records. **Start for real** removes the demo key and opens the empty
real locker. The app shell and the sample metadata are precached after the
first visit, so the demo is usable offline.
