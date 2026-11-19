import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const startOnly = process.argv.includes('--start-only');
const win = process.platform === 'win32';

function exists(file) {
  try {
    return fs.existsSync(file);
  } catch {
    return false;
  }
}

function firstExisting(candidates) {
  return candidates.find((item) => item && exists(item));
}

const sdk =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  firstExisting([
    path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk'),
    path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
  ]);

if (!sdk) {
  console.error('Android SDK를 찾지 못했어요. Android Studio가 설치돼 있는지 확인해 주세요.');
  process.exit(1);
}

process.env.ANDROID_HOME = sdk;
process.env.ANDROID_SDK_ROOT = sdk;

if (!process.env.JAVA_HOME) {
  const jdk = firstExisting([
    path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Android', 'Android Studio', 'jbr'),
    path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Android', 'Android Studio', 'jre'),
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Android', 'Android Studio', 'jbr'),
  ]);
  if (jdk) process.env.JAVA_HOME = jdk;
}

const adb = path.join(sdk, 'platform-tools', win ? 'adb.exe' : 'adb');
if (!exists(adb)) {
  console.error(`adb가 없어요: ${adb}`);
  process.exit(1);
}

const listed = spawnSync(adb, ['devices'], { encoding: 'utf8' });
const lines = (listed.stdout || '')
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('List of'));
const ready = lines.filter((line) => /\tdevice$/.test(line));
const unauthorized = lines.filter((line) => /\tunauthorized$/.test(line));

if (!ready.length) {
  if (unauthorized.length) {
    console.error('폰 화면에 "USB 디버깅 허용"이 떠 있으면 허용을 눌러 주세요.');
  } else {
    console.error('연결된 안드로이드 폰이 없어요.');
    console.error('1) 설정 → 휴대전화 정보 → 빌드번호 7번 탭 → 개발자 옵션');
    console.error('2) USB 디버깅 켜기');
    console.error('3) 데이터 케이블로 이 컴퓨터에 연결 (충전 전용 선은 안 됨)');
  }
  process.exit(1);
}

spawnSync(adb, ['reverse', 'tcp:8081', 'tcp:8081'], { stdio: 'inherit' });
spawnSync(adb, ['reverse', 'tcp:4000', 'tcp:4000'], { stdio: 'inherit' });

const args = startOnly ? ['expo', 'start', '--localhost', '--dev-client', '--android'] : ['expo', 'run:android', '--device'];
const child = spawn(win ? 'npx.cmd' : 'npx', args, {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
  shell: win,
});
child.on('exit', (code) => process.exit(code ?? 0));
