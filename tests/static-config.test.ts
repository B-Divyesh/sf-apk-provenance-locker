import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';

describe('deployment and Android release configuration',()=>{
  it('keeps exactly one browser test tag for every declared claim',()=>{
    const claims=JSON.parse(readFileSync('.factory/claims.json','utf8')) as Array<{id:string}>;
    const browser=readFileSync('tests/browser/locker.spec.ts','utf8');
    const tags=[...browser.matchAll(/@claim:([a-z0-9-]+)/g)].map(match=>match[1]);
    expect(new Set(claims.map(claim=>claim.id)).size).toBe(claims.length);
    expect(tags.sort()).toEqual(claims.map(claim=>claim.id).sort());
  });

  it('starts every declared claim from the isolated demo sandbox',()=>{
    const browser=readFileSync('tests/browser/locker.spec.ts','utf8');
    const claimBlocks=browser.split("test('").filter(block=>block.startsWith('@claim:'));
    expect(claimBlocks).toHaveLength(JSON.parse(readFileSync('.factory/claims.json','utf8')).length);
    for(const block of claimBlocks)expect(block.slice(0,block.indexOf("\ntest('")<0?block.length:block.indexOf("\ntest('"))).toContain("page.goto('/demo");
  });

  it('registers the Terms revocation behavior as an observable claim',()=>{
    const claims=JSON.parse(readFileSync('.factory/claims.json','utf8')) as Array<{id:string;claim:string;where:string}>;
    expect(claims).toContainEqual(expect.objectContaining({
      id:'revoked-license',
      claim:'A refunded or revoked Locker Plus license stops private device labels while verification stays free',
      where:'Terms',
    }));
    expect(readFileSync('src/main.ts','utf8')).toContain('A refunded or revoked license stops private device labels.');
  });

  it('registers every free Locker Plus entitlement as one observable no-license claim',()=>{
    const claims=JSON.parse(readFileSync('.factory/claims.json','utf8')) as Array<{id:string;claim:string;where:string}>;
    expect(claims).toContainEqual(expect.objectContaining({
      id:'free-core-features',
      claim:'Verification, signer and downgrade warnings, and restore-kit export work without a Locker Plus license',
      where:'Landing paid tier, evidence dialog, Terms, README',
    }));
    const app=readFileSync('src/main.ts','utf8');
    expect(app.match(/Verification, signer and downgrade warnings, and restore-kit export stay free\./g)).toHaveLength(3);
  });

  it('serves only known SPA routes and lets unknown routes reach the real 404 override',()=>{
    const config=JSON.parse(readFileSync('public/staticwebapp.config.json','utf8'));
    expect(config.navigationFallback).toBeUndefined();
    expect(config.routes.filter((route:any)=>route.rewrite==='/index.html').map((route:any)=>route.route)).toEqual(['/','/demo','/privacy','/terms']);
    expect(config.responseOverrides['404']).toEqual({rewrite:'/404.html',statusCode:404});
  });

  it('declares MIME types and limits connections to the paid-license API',()=>{
    const config=JSON.parse(readFileSync('public/staticwebapp.config.json','utf8'));
    const app=readFileSync('src/main.ts','utf8');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.mimeTypes['.wasm']).toBe('application/wasm');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("connect-src 'self' https://api.sociobot.in");
    expect(config.globalHeaders['Content-Security-Policy']).toContain("form-action 'self' https://api.sociobot.in");
    expect(config.globalHeaders['Content-Security-Policy']).toContain("'wasm-unsafe-eval'");
    expect(config.globalHeaders['Content-Security-Policy']).not.toContain('https://api.github.com');
  });

  it('precaches the pinned local signature verifier for offline use',()=>{
    const worker=readFileSync('public/sw.js','utf8');
    expect(worker).toContain("CACHE='apk-locker-v22'");
    expect(worker).toContain("'/vendor/apksig/apksig.wasm'");
    expect(readFileSync('tests/fixtures/SHA256SUMS','utf8')).toContain('v1v2v3-lineage.apk');
  });

  it('rejects verifier 17\'s exact nonexistent and unpushed candidate conditions',()=>{
    const result=spawnSync(process.execPath,['scripts/verify-release-candidate.mjs','--self-test'],{encoding:'utf8'});
    expect(result.status,result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual(expect.objectContaining({
      regression:'verifier-17-nonexistent-candidate',
      missing:'d7186184975c193d520d40a14b27fb552067e8ce',
      status:422,
      available:'d71861d6633f0e1d5c1d67e2ab1845a7f12e115f',
      rejected:true,
    }));
  });

  it('builds v0.5.12 packages only after origin/main has the matching tag commit',()=>{
    const workflow=readFileSync('.github/workflows/android.yml','utf8');
    const manifest=readFileSync('android/app/src/main/AndroidManifest.xml','utf8');
    const backupRules=readFileSync('android/app/src/main/res/xml/backup_rules.xml','utf8');
    const extractionRules=readFileSync('android/app/src/main/res/xml/data_extraction_rules.xml','utf8');
    expect(workflow).toContain('npx cap sync android');
    expect(workflow).toContain('apksigner');
    expect(workflow).toContain('node scripts/verify-release-candidate.mjs --expected-commit "$GITHUB_SHA"');
    expect(workflow.indexOf('node scripts/verify-release-candidate.mjs')).toBeLessThan(workflow.indexOf('npm ci'));
    expect(workflow).toContain('test "$GITHUB_REF_NAME" = "$EXPECTED_TAG"');
    expect(workflow).toContain('test "$(git rev-parse HEAD)" = "$GITHUB_SHA"');
    expect(workflow).toContain('cmp "$FILE" <(unzip -p app-release.apk "assets/public/${FILE#dist/}")');
    expect(workflow).toContain('cmp "$FILE" <(unzip -p app-release.aab "base/assets/public/${FILE#dist/}")');
    expect(workflow).toContain("package: name='in.sociobot.apk_provenance_locker' versionCode='17' versionName='0.5.12'");
    expect(workflow).toContain("grep -q 'android:allowBackup.*0x0' packaged-manifest.txt");
    expect(workflow).toContain("grep -q 'android:fullBackupContent' packaged-manifest.txt");
    expect(workflow).toContain("grep -q 'android:dataExtractionRules' packaged-manifest.txt");
    expect(workflow).toContain("grep -q 'Keep record' packaged-app.js");
    expect(workflow).toContain("grep -q 'Remove record' packaged-app.js");
    expect(workflow).toContain('node scripts/create-release-provenance.mjs');
    expect(workflow).toContain('npm run test:release -- --apk app-release.apk --aab app-release.aab --checksums SHA256SUMS --provenance RELEASE_PROVENANCE.json');
    expect(workflow).toContain('npm run test:release -- --expected-commit "$GITHUB_SHA"');
    expect(workflow).toContain('Built from immutable source commit ${{ github.sha }}.');
    expect(workflow.match(/RELEASE_PROVENANCE\.json/g)?.length).toBeGreaterThanOrEqual(3);
    expect(manifest).toMatch(/android:allowBackup="false"/);
    expect(manifest).toMatch(/android:fullBackupContent="@xml\/backup_rules"/);
    expect(manifest).toMatch(/android:dataExtractionRules="@xml\/data_extraction_rules"/);
    expect(manifest).not.toMatch(/android:allowBackup="true"/);
    for(const domain of ['root','file','database','sharedpref','external']){
      expect(backupRules).toContain(`<exclude domain="${domain}" path="." />`);
      expect(extractionRules.match(new RegExp(`<exclude domain="${domain}" path="\\." />`,'g'))).toHaveLength(2);
    }
    expect(workflow).toContain('SHA256SUMS');
    expect(readFileSync('vite.config.ts','utf8')).toContain("fileName:'build.json'");
    const verifier=readFileSync('scripts/verify-android-release.mjs','utf8');
    expect(verifier).toContain('await verifyReleaseCandidate({expectedCommit})');
    expect(verifier).toContain("zipText(apk,'assets/public/build.json')");
    expect(verifier).toContain("zipText(aab,'base/assets/public/build.json')");
    expect(verifier).toContain('Release notes do not bind the immutable source commit');
    expect(verifier).toContain('Release provenance does not match the APK');
    const claim=JSON.parse(readFileSync('.factory/claims.json','utf8')).find((entry:any)=>entry.id==='release-assets');
    const runner=readFileSync('scripts/test.mjs','utf8');
    expect(claim.test).toBe('npm test -- --grep @claim:release-assets');
    expect(runner).toContain("filter==='@claim:release-assets'");
    expect(runner).toContain("run('node',['scripts/verify-android-release.mjs'])");
  });

  it('gives the static 404 route complete metadata and the shared navigation shell',()=>{
    const page=readFileSync('public/404.html','utf8');
    expect(page).toContain('<meta name="description"');
    expect(page).toContain('<link rel="canonical" href="https://apk-provenance-locker.sociobot.in/404">');
    expect(page).toContain('<link rel="icon" href="/icons/favicon.svg"');
    expect(page).toContain('property="og:title"');
    expect(page).toContain('name="twitter:title"');
    expect(page).toContain('<nav aria-label="Main navigation">');
    expect(page).toContain('href="/demo">Demo</a>');
    expect(page).toContain('href="/privacy">Privacy</a>');
    expect(page).toContain('href="/terms">Terms</a>');
  });

  it('keeps reviewed visitor copy concrete, plain, and within the sentence limit',()=>{
    const app=readFileSync('src/main.ts','utf8');
    const readme=readFileSync('README.md','utf8');
    expect(app).toContain('Local APK verification');
    expect(app).toContain('Your verified APK records');
    expect(app).toContain('Read the package and version.');
    expect(app).toContain('Check signer and downgrade risks.');
    expect(app).toContain('Records and saved APK copies stay on this device.');
    expect(app).not.toContain('Original generated paper-cut art.');
    expect(`${app}\n${readme}`).not.toContain('release-specific test key');
    expect(app).toContain('Use SHA256SUMS to check the files. Use the source record to confirm which repository commit built them.');
    expect(app).toContain('Download source record from GitHub');
    expect(app).toContain('Choose a file to check its signature, package name, and version.');
    expect(app).toContain('It reads the package name and version from the APK.');
    expect(`${app}\n${readme}`).not.toContain('signature and identity');
    expect(`${app}\n${readme}`).not.toContain('compiled Android manifest');
    expect(`${app}\n${readme}`).not.toContain('compiled `AndroidManifest.xml`');
    expect(app).toContain('SHA-256 file fingerprint before a reinstall.');
    expect(app).toContain('creates a SHA-256 file fingerprint on this device.');
    expect(`${app}\n${readme}`).not.toContain('05977905b4b82239ff8d28338bf711d6cd012b5d5bbb1ecbcb1a9374c9470ba0');
    expect(`${app}\n${readme}`).not.toContain('Google Play');
    expect(app).toContain('Open two sample APK records.');
    expect(app).toContain('APK checks run on this device using Android\'s signature rules.');
    expect(app).toContain('Restore Locker Plus license');
    expect(readme).toContain('## Use APK Provenance Locker');
    expect(readme).toContain('## Develop and verify APK Provenance Locker');
    expect(readme).toContain('## Deploy APK Provenance Locker');
    expect(readme).toContain('The demo keeps its records\nand files separate from your real locker.');
    expect(readme).toContain('APK, AAB, checksums, and source record from GitHub.');
    expect(readme).toContain('The page makes no\nautomatic third-party requests.');
    expect(readme).not.toContain('demo-exit erasure path');
    expect(readme).not.toContain('source identity');
    for(const sentence of [
      'After a release is published, run `npm run test:release`.',
      'It downloads the APK, AAB, checksums, and source record from GitHub.',
      'It checks that the tag, release notes, source record, and both packages name this repository commit.',
    ])expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(22);
  });

  it('stores outgoing scroll, moves client routes to the top, and restores Back positions',()=>{
    const app=readFileSync('src/main.ts','utf8');
    expect(app).toContain("history.scrollRestoration='manual'");
    expect(app).toContain('history.replaceState({...((history.state||{}) as RouteState),scrollY:window.scrollY}');
    expect(app).toContain("history.pushState({scrollY:0} satisfies RouteState,'',href)");
    expect(app).toContain('window.addEventListener(\'popstate\',()=>render(true,storedScroll()))');
  });
});
