// Build script for the project
// Usage: tsx scripts/build.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import shell from 'shelljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '..', 'src');
const files = fs.readdirSync(srcDir);

shell.exec('tsc');
shell.exec('rollup --config rollup.config.js');

// create CTS versions of the typedefs for CJS
for (const fileName of files) {
  const stem = fileName.split('.')[0];
  shell.cp([`dist/${stem}.d.ts`], `dist/${stem}.d.cts`);
}

// create CJS versions of the types
shell.cp([`dist/types.js`], `dist/types.cjs`);

// point the export in the CJS index typedefs at the CJS types
shell.sed('-i', 'types.js', 'types.cjs', 'dist/index.d.cts');
