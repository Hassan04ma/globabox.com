import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const vite = resolve('node_modules/vite/bin/vite.js');
const result = spawnSync(process.execPath, [vite, 'build'], {
  stdio: 'inherit',
  shell: false
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
