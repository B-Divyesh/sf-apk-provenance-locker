import {readFileSync, writeFileSync} from 'node:fs';

// Capacitor 6 imports tar as a default export. tar 7 removed that compatibility
// shape. Keep the audited tar 7 release while restoring `cap sync` for the
// generated Cordova bridge project.
const file=new URL('../node_modules/@capacitor/cli/dist/util/template.js',import.meta.url);
const source=readFileSync(file,'utf8');
const fixed=source.replace('tar_1.default.extract(', '(tar_1.default ?? tar_1).extract(');
if(fixed!==source)writeFileSync(file,fixed);
