import { access, readFile } from 'node:fs/promises';

const required = [
  'index.html',
  'src/main.js',
  'src/styles.css',
  'server/index.js',
  'server/director.js',
  'server/agents.js',
  'tests/director.test.js',
  'tests/agents.test.js'
];
const failures = [];
for (const file of required) {
  try { await access(new URL('../' + file, import.meta.url)); }
  catch { failures.push('Missing required file: ' + file); }
}
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (!pkg.scripts?.test || !pkg.scripts?.build) failures.push('Missing test/build scripts.');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Project structure checks passed.');
