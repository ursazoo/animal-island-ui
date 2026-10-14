import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';
import { resolve } from 'node:path';
import { readFileSync, mkdirSync, copyFileSync, readdirSync, writeFileSync } from 'node:fs';
import less from 'less';

export default defineConfig({
    plugins: [
        react(),
        libAssetsPlugin({ outputPath: 'assets', limit: 0 }),
        {
            name: 'animal-taro-style-entries',
            async writeBundle(_options, bundle) {
                const variables = readFileSync('src/styles/variables.less', 'utf8');
                const theme = await less.render(variables + readFileSync('src/taro/theme.less', 'utf8'), {
                    filename: resolve('src/taro/theme.less'),
                });
                const styles = Object.values(bundle).filter(
                    (asset) => asset.type === 'asset' && asset.fileName.endsWith('.css')
                );
                writeFileSync(
                    'dist/taro/style.css',
                    theme.css + styles.map((asset) => (asset.type === 'asset' ? asset.source : '')).join('\n')
                );
                mkdirSync('dist/taro/fonts', { recursive: true });
                copyFileSync('node_modules/naive-icons/LICENSE', 'dist/taro/ICON-LICENSE.txt');
                for (const font of readdirSync('src/assets/fonts').filter((name) => name.endsWith('.woff2')))
                    copyFileSync(`src/assets/fonts/${font}`, `dist/taro/fonts/${font}`);
                const fonts = await less.render(readFileSync('src/styles/fonts.less', 'utf8'));
                writeFileSync('dist/taro/fonts.css', fonts.css.replaceAll('../assets/fonts/', './fonts/'));
            },
        },
    ],
    css: {
        modules: { generateScopedName: 'animal-taro-[local]-[hash:base64:5]', localsConvention: 'camelCase' },
        preprocessorOptions: { less: { additionalData: `@import "${resolve('src/styles/variables.less')}";` } },
    },
    build: {
        outDir: 'dist/taro',
        emptyOutDir: true,
        cssCodeSplit: true,
        minify: false,
        lib: { entry: { index: resolve('src/taro/index.ts'), h5: resolve('src/taro/h5.tsx') }, formats: ['es'] },
        rollupOptions: {
            external: (id) => /^(react|react-dom|@tarojs\/[^/]+)(\/|$)/.test(id),
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src',
                entryFileNames: (chunk) => (['index', 'h5'].includes(chunk.name) ? '[name].js' : '[name].js'),
                assetFileNames: '[name][extname]',
            },
        },
    },
});
