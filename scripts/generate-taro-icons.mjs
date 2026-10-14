// Rasterize original MIT naive-icons drawings; no hand-drawn substitutes.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { mkdirSync } from 'node:fs';
import * as icons from 'naive-icons';
import sharp from 'sharp';
mkdirSync('src/taro/assets', { recursive: true });
for (const name of ['Donut', 'Close', 'ChevronDown', 'Check']) {
    const svg = renderToStaticMarkup(createElement(icons[`${name}Icon`], { size: 84, color: '#725d42' }));
    await sharp(Buffer.from(svg)).png().toFile(`src/taro/assets/${name.toLowerCase()}.png`);
}
