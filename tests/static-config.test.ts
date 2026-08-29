import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';

describe('deployment and Android release configuration',()=>{
  it('serves only known SPA routes and lets unknown routes reach the real 404 override',()=>{
    const config=JSON.parse(readFileSync('public/staticwebapp.config.json','utf8'));
    expect(config.navigationFallback).toBeUndefined();
    expect(config.routes.filter((route:any)=>route.rewrite==='/index.html').map((route:any)=>route.route)).toEqual(['/','/demo','/privacy','/terms']);
    expect(config.responseOverrides['404']).toEqual({rewrite:'/404.html',statusCode:404});
  });

  it('declares the web manifest MIME type and blocks undeclared connections',()=>{
    const config=JSON.parse(readFileSync('public/staticwebapp.config.json','utf8'));
    const app=readFileSync('src/main.ts','utf8');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.mimeTypes['.wasm']).toBe('application/wasm');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("connect-src 'self'");
    expect(config.globalHeaders['Content-Security-Policy']).toContain("'wasm-unsafe-eval'");
    expect(config.globalHeaders['Content-Security-Policy']).not.toContain('api.github.com');
    expect(app).not.toContain('api.github.com');
  });

  it('precaches the pinned local signature verifier for offline use',()=>{
    const worker=readFileSync('public/sw.js','utf8');
    expect(worker).toContain("CACHE='apk-locker-v6'");
    expect(worker).toContain("'/vendor/apksig/apksig.wasm'");
    expect(readFileSync('tests/fixtures/SHA256SUMS','utf8')).toContain('v1v2v3-lineage.apk');
  });

  it('syncs Capacitor and validates release artifacts before publication',()=>{
    const workflow=readFileSync('.github/workflows/android.yml','utf8');
    expect(workflow).toContain('npx cap sync android');
    expect(workflow).toContain('apksigner');
    expect(workflow).toContain("package: name='in.sociobot.apk_provenance_locker' versionCode='3' versionName='0.3.0'");
    expect(workflow).toContain('SHA256SUMS');
  });
});
