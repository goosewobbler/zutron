// Build script for the project
// Usage: tsx scripts/build.ts
import shell from 'shelljs';

const entryPoints = ['main', 'preload', 'index'];

shell.exec('tsc');
shell.exec('rollup --config rollup.config.js');

for (const entry of entryPoints) {
  shell.cp([`dist/${entry}.d.ts`], `dist/${entry}.d.cts`);
}
