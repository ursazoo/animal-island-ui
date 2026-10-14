import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';
const seen = new Set();
function visit(file) {
    if (seen.has(file)) return;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g)) {
        const id = match[1];
        assert.ok(
            !id.startsWith('react-dom') && !id.startsWith('naive-icons'),
            `${file}: forbidden runtime dependency ${id}`
        );
        if (id.startsWith('.')) {
            let next = resolve(dirname(file), id);
            if (!existsSync(next)) next += '.d.ts';
            if (/\.(js|ts)$/.test(next)) visit(next);
        }
    }
}
visit(resolve('dist/taro/index.js'));
visit(resolve('dist/types/taro/index.d.ts'));
const files = [];
function walk(dir) {
    for (const name of readdirSync(dir)) {
        const file = `${dir}/${name}`;
        if (statSync(file).isDirectory()) walk(file);
        else files.push(file);
    }
}
walk('examples/taro/dist/weapp');
assert.ok(!files.some((file) => /\.(woff2?|ttf|otf)$/.test(file)), 'Weapp must not bundle browser fonts');
const bytes = files.reduce((sum, file) => sum + statSync(file).size, 0);
assert.ok(bytes < 2 * 1024 * 1024, 'Weapp main package exceeds 2MiB');
const template = files
    .filter((file) => file.endsWith('.wxml'))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
assert.ok(template.includes('picker-view'));
assert.ok(template.includes('bindpickstart'));
assert.ok(template.includes('bindpickend'));
assert.ok(template.includes('root-portal'));
console.log(
    `Taro JS + declarations: ${seen.size} local modules, no Web/icon runtime dependencies. Weapp ${bytes} bytes, native PickerView events and RootPortal emitted; no browser fonts.`
);
