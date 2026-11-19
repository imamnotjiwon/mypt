import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 4000);
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const children = [];

function spawnInherit(cmd, args, extra = {}) {
  const child = spawn(cmd, args, { cwd: root, stdio: extra.stdio ?? 'inherit', shell: extra.shell ?? false, ...extra });
  children.push(child);
  return child;
}

function stopAll() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});
process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

function publishUrl(url) {
  const dir = path.join(root, '.api-publish');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '.nojekyll'), '');
  fs.writeFileSync(path.join(dir, 'api-config.json'), `${JSON.stringify({ apiUrl: url }, null, 2)}\n`);
  console.log(`\n공개 주소: ${url}`);
  console.log('GitHub Pages에 주소를 올리는 중...\n');
  const publish = spawn(npx, ['gh-pages', '--nojekyll', '-d', '.api-publish', '--add'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });
  publish.on('exit', (code) => {
    if (code === 0) {
      console.log('\n폰은 https://imamnotjiwon.github.io/mypt/api-config.json 에서 이 주소를 읽습니다.');
      console.log('이 창을 닫으면 공개 연결이 끊어집니다. 컴퓨터와 이 터미널을 켜 두세요.\n');
    } else {
      console.log('\n주소 업로드에 실패했습니다. 터널은 켜져 있으니 APK에 넣은 주소로도 연결됩니다.\n');
    }
  });
}

const server = spawnInherit(process.execPath, ['server/index.mjs']);
server.on('exit', (code) => {
  if (code) console.error('서버가 종료되었습니다.', code);
  stopAll();
  process.exit(code || 0);
});

const tunnel = spawn(npx, ['--yes', 'cloudflared', 'tunnel', '--url', `http://127.0.0.1:${PORT}`], {
  cwd: root,
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});
children.push(tunnel);

let published = false;
function onLog(buf) {
  const text = buf.toString();
  process.stderr.write(text);
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (match && !published) {
    published = true;
    publishUrl(match[0]);
  }
}
tunnel.stdout.on('data', onLog);
tunnel.stderr.on('data', onLog);
tunnel.on('exit', (code) => {
  if (!published) console.error('공개 터널이 종료되었습니다.', code);
  stopAll();
  process.exit(code || 0);
});
