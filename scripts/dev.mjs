import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [
  spawn(process.execPath, ['--watch', 'server/index.js'], { cwd: root, stdio: 'inherit' }),
  spawn(npm, ['run', 'dev:client'], { cwd: root, stdio: 'inherit' })
];

let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
}
for (const child of children) child.on('exit', (code) => {
  if (!stopping && code !== 0) {
    console.error('A development process exited unexpectedly.');
    stop();
    process.exitCode = code || 1;
  }
});
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
