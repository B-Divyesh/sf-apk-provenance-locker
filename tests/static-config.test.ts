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

  it('serves only known SPA routes and lets unknown routes reach the real 404 override',()=>{
    const config=JSON.parse(readFileSync('public/staticwebapp.config.json','utf8'));
    expect(config.navigationFallback).toBeUndefined();
    expect(config.routes.filter((route:any)=>route.rewrite==='/index.html').map((route:any)=>route.route)).toEqual(['/','/demo','/privacy','/terms']);
    expect(config.responseOverrides['404']).toEqual({rewrite:'/404.html',statusCode:404});
  });

  it('declares the web manifest MIME type and limits connections to the paid-license API',()=>{
    const config=JSON.parse(readFileSync('public/staticwebapp.config.json','utf8'));
    const app=readFileSync('src/main.ts','utf8');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.mimeTypes['.wasm']).toBe('application/wasm');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("connect-src 'self' https://api.sociobot.in");
    expect(config.globalHeaders['Content-Security-Policy']).toContain("form-action 'self' https://api.sociobot.in");
    expect(config.globalHeaders['Content-Security-Policy']).toContain("'wasm-unsafe-eval'");
    expect(config.globalHeaders['Content-Security-Policy']).not.toContain('api.github.com');
    expect(app).not.toContain('api.github.com');
  });

  it('precaches the pinned local signature verifier for offline use',()=>{
    const worker=readFileSync('public/sw.js','utf8');
    expect(worker).toContain("CACHE='apk-locker-v12'");
    expect(worker).toContain("'/vendor/apksig/apksig.wasm'");
    expect(readFileSync('tests/fixtures/SHA256SUMS','utf8')).toContain('v1v2v3-lineage.apk');
  });

  it('builds v0.5.2 packages only from the matching tag and audits packaged identity, privacy, and removal safety',()=>{
    const workflow=readFileSync('.github/workflows/android.yml','utf8');
    const manifest=readFileSync('android/app/src/main/AndroidManifest.xml','utf8');
    const backupRules=readFileSync('android/app/src/main/res/xml/backup_rules.xml','utf8');
    const extractionRules=readFileSync('android/app/src/main/res/xml/data_extraction_rules.xml','utf8');
    expect(workflow).toContain('npx cap sync android');
    expect(workflow).toContain('apksigner');
    expect(workflow).toContain('test "$GITHUB_REF_NAME" = "$EXPECTED_TAG"');
    expect(workflow).toContain('test "$(git rev-parse HEAD)" = "$GITHUB_SHA"');
    expect(workflow).toContain('cmp "$FILE" <(unzip -p app-release.apk "assets/public/${FILE#dist/}")');
    expect(workflow).toContain('cmp "$FILE" <(unzip -p app-release.aab "base/assets/public/${FILE#dist/}")');
    expect(workflow).toContain("package: name='in.sociobot.apk_provenance_locker' versionCode='7' versionName='0.5.2'");
    expect(workflow).toContain("grep -q 'android:allowBackup.*0x0' packaged-manifest.txt");
    expect(workflow).toContain("grep -q 'android:fullBackupContent' packaged-manifest.txt");
    expect(workflow).toContain("grep -q 'android:dataExtractionRules' packaged-manifest.txt");
    expect(workflow).toContain("grep -q 'Keep record' packaged-app.js");
    expect(workflow).toContain("grep -q 'Remove record' packaged-app.js");
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

  it('keeps reviewed visitor copy concrete and discloses the published Android package',()=>{
    const app=readFileSync('src/main.ts','utf8');
    const readme=readFileSync('README.md','utf8');
    expect(app).toContain('Local APK verification');
    expect(app).toContain('Your verified APK records');
    expect(app).toContain('Read the package and version.');
    expect(app).toContain('Check signer and downgrade risks.');
    expect(app).toContain('Records and saved APK copies stay on this device.');
    expect(app).not.toContain('Original generated paper-cut art.');
    expect(`${app}\n${readme}`).not.toContain('release-specific test key');
    expect(app).toContain("Use the versioned SHA256SUMS file to check the APK's SHA-256 file fingerprint.");
    expect(app).toContain('SHA-256 file fingerprint before a reinstall.');
    expect(app).toContain('creates a SHA-256 file fingerprint on this device.');
    expect(`${app}\n${readme}`).not.toContain('05977905b4b82239ff8d28338bf711d6cd012b5d5bbb1ecbcb1a9374c9470ba0');
    expect(`${app}\n${readme}`).not.toContain('Google Play');
    expect(app).toContain('Open two sample APK records.');
    expect(app).toContain('APK checks run on this device using Android\'s signature rules.');
    expect(app).toContain('Restore Locker Plus license');
    expect(readme).toContain('## Use APK Provenance Locker');
  });
});
