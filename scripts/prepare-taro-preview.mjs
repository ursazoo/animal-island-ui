import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
const run = (args, opts = {}) => execFileSync('npm', args, { stdio: 'inherit', ...opts });
run(['run', 'build']);
mkdirSync('examples/taro/vendor', { recursive: true });
for (const file of readdirSync('examples/taro/vendor'))
    if (file.endsWith('.tgz')) rmSync(`examples/taro/vendor/${file}`);
const result = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--pack-destination', 'examples/taro/vendor'], { encoding: 'utf8' })
);
run(['install', '--save-exact', `./vendor/${result[0].filename}`], { cwd: 'examples/taro' });
run(['run', 'typecheck'], { cwd: 'examples/taro' });
run(['run', 'build:h5'], { cwd: 'examples/taro' });
run(['run', 'build:weapp'], { cwd: 'examples/taro' });
