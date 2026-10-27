import { spawnSync } from 'node:child_process';
// Intentionally do not forward npm script args: Cloudflare dashboard may append a stray token.
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['vite', 'build'], { stdio: 'inherit', shell: false });
if (result.error) { console.error(result.error); process.exit(1); }
process.exit(result.status ?? 1);
