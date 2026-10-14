import { defineConfig } from '@tarojs/cli';
export default defineConfig({
    projectName: 'animal-island-taro-preview',
    date: '2026-10-14',
    designWidth: 375,
    deviceRatio: { 375: 2, 640: 1.17, 750: 1, 828: 0.905 },
    sourceRoot: 'src',
    outputRoot: process.env.TARO_ENV === 'h5' ? 'dist/h5' : 'dist/weapp',
    framework: 'react',
    compiler: 'webpack5',
    plugins: [],
    cache: { enable: false },
    defineConstants: { ANIMAL_FONT_BASE: JSON.stringify(process.env.ANIMAL_FONT_BASE ?? '') },
    mini: { postcss: { pxtransform: { enable: true }, cssModules: { enable: false } } },
    h5: {
        esnextModules: ['animal-island-ui'],
        publicPath: '/',
        staticDirectory: 'static',
        router: { mode: 'hash' },
        postcss: {
            pxtransform: { enable: true, config: { baseFontSize: 20, minRootSize: 20, maxRootSize: 40 } },
            cssModules: { enable: false },
        },
    },
});
