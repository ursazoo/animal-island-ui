# Taro first batch

This fork adds **Button, Card, Input, bottom Drawer and single Select** through `animal-island-ui/taro`.
The existing Web entry remains the default. This is the first five of 38 applicable modules, not a complete mobile library.
The migration contract is [Taro UI adaptation standard](taro-ui-adaptation-standard.md).

## Install and consume

Use Taro 4.3 with React 18. The fork has not been published to npm. From this repository:

```sh
npm ci
npm run preview:prepare
```

The prepare command builds the library, runs `npm pack`, installs that `.tgz` into the independent
`examples/taro` consumer, typechecks the consumer, and builds H5 and WeChat output.
For another project, install the generated `examples/taro/vendor/animal-island-ui-2.2.1.tgz` explicitly.
The unchanged version identifies the upstream baseline; the tarball integrity identifies this local fork build.
Do not install the upstream npm release expecting these exports.

```tsx
import { Button, Card, Input, Drawer, Select } from 'animal-island-ui/taro';
import 'animal-island-ui/taro/style';

// App entry: the compile-time branch keeps DOM helpers and large font assets out of weapp.
if (process.env.TARO_ENV === 'h5') {
    require('animal-island-ui/taro/h5').installH5Adapter();
    require('animal-island-ui/taro/fonts');
}
```

The H5 adapter is required for portal placement, focus/keyboard handling and page scroll locking.
It is a separate library export; preview pages do not implement replacement components.

The stylesheet is authored in logical pixels for a 375 design width. Configure the consumer:

```ts
designWidth: 375,
deviceRatio: { 375: 2, 640: 1.17, 750: 1, 828: 0.905 },
```

Projects using another design width must supply an appropriate Taro `designWidth(input)` mapping for
this package's styles. Do not apply 750-width conversion to the 375-width library CSS.

## Component contracts

- **Button:** original type/size/danger/ghost/block/loading variants, native Taro button props;
  `htmlType` maps submit/reset to `formType`. Loading and disabled both block activation.
- **Card:** original color/pattern/type unions. `hoverable` opts into touch feedback; actionable H5 cards
  gain keyboard activation. Passive cards have no interaction effect.
- **Input:** Taro input props, `value`/`defaultValue`, prefix/suffix, clear, shadow and error/warning.
  `onChange(value: string)` is intentionally different from the Web DOM event. `onInput` exposes the
  original Taro event. Clearing calls `onChange('')`, then `onClear()`.
- **Drawer:** controlled `open`, `title`, `onClose`, `footer`, `maskClosable=true`, CSS string `height`,
  `className`, `ariaLabel`; only `placement='bottom'` in this batch. No `pushBackground`, side placement,
  drag dismissal or arbitrary mask styles are claimed. Height is bounded to 40%–75% of the viewport (keyboard space may reduce the limit). Scrollable body with 8px top inset and 24px scroll padding to keep the whole focused input and its external ring visible, opaque fixed footer with 16px top spacing and a soft upward shadow, and bottom safe area;
  nested layer dismissal, H5 Escape/Tab/focus restore and scroll locks. WeChat uses RootPortal and keyboard-height adjustment.
- **Select:** controlled `options: {key,label}[]`, `value: string`, `onChange(key)`; keys must be unique and nonempty.
  Ordinary mode uses embedded PickerView; search mode uses a filtered list. Opening initializes a draft;
  confirm commits, cancel/mask/close discards. Invalid values highlight the first item without writing back.
  No options means disabled confirmation. Option reorder preserves the draft key; removed keys repair to the first item;
  external value changes win. `allowClear`, `onClear`, `clearAriaLabel`, `showSearch`, `filterOption`,
  `optionFilterProp`, `onSearch`, `notFoundContent`, `title`, `className`, `aria-label` and `aria-labelledby` are supported.
  Touch scrolls the PickerView directly, without previous/next buttons or a confirmation hint. On H5, mandatory scroll snapping and the explicit adapter cover touch inertia, wheel and trackpad input; confirmation stays disabled until the displayed row is centered and its key is synchronized. H5 also supports ArrowUp/ArrowDown when the wheel is focused.

Exact props are exported in the package declarations and mirrored in the Skill's Taro references.
Web event handlers cannot be copied to Taro without adapting their event/value signatures.

## Visual preservation

The Taro styles import the corresponding original Less definitions. Select uses reference mixins from
its original trigger; the internal PickerView uses the original warm-white background token and mint primary token at 10% opacity, with a matching warm-white mask. The selection strip is inset 12px on each side of the wheel. The outer drawer keeps its cream background.
The primary button remains cream with its brown 5px stack, except in multi-action Drawer footers: these use the same soft shadow and no vertical hover/press offset on every button to align visible contours. A single footer action retains its original depth. Card remains shadowless; Input defaults to no shadow.
Mobile differences: Input minimum visible height 44px; small buttons extend their hit regions; clear/close controls
have 44px targets; Drawer title 24px, body 16px, bottom safe-area padding. These are deliberate touch adaptations.
Runtime theme variables are generated from the same Less source onto `page` and `:root`.

PNG icons are rasterized at 3x from `naive-icons@1.6.0` (MIT), preserving the source drawings without importing
Web SVG React components into weapp. Run `node scripts/generate-taro-icons.mjs` to regenerate them.

H5 opt-in fonts are copied from the original woff2 files. WeChat must load the same fonts from a configured HTTPS
font server via `Taro.loadFontFace`; browser fonts are intentionally excluded from the mini-program package.
Set `ANIMAL_FONT_BASE` when building the example to exercise this path. Without it the preview explicitly says
that system fallback fonts are in use. That state does not pass visual-fidelity acceptance on WeChat.

Drawer actions fill the available row: two actions have equal widths, and a single action fills the row.
The close image is 32px inside a 44px touch target.

## Preview and verification

- `examples/taro/src/pages/index/index.tsx`: actual component gallery, composed form and 39-module status catalog.
- `examples/taro/preview.html`: desktop preview frame, 320/375/414 controls and baseline comparison; copy it alongside H5 output.
- `examples/web-baseline/main.tsx`: original Web component fixture, served by root `npm run dev`.
- `npm run test:run`: existing Web regression/a11y suites plus Taro state and overlay lifecycle tests.
- `node scripts/verify-taro-package.mjs`: follows published Taro JS/types dependency graphs, checks native templates,
  verifies no Web/icon runtime dependency or bundled browser fonts in weapp and checks package size.
- `node scripts/verify-taro-browser.mjs`: real H5 interaction checks against localhost:4173, including widths,
  confirm/cancel/search/form, keyboard, nested overlays and scroll restoration. Uses local Google Chrome after the
  session's Moli navigation timeout. Set `ANIMAL_QA_OUTPUT` to choose an evidence directory.

Browser testing and successful WeChat compilation do **not** prove WeChat DevTools or real iOS/Android acceptance.
Native keyboard, screen-reader behavior, safe areas, font hosting and native wheel inertia still require device checks.
The first-batch H5 preview was accepted by the project owner on 2026-10-14. Source changes are maintained on
the fork branch `feat/taro-first-batch`; npm publication and website deployment are separate steps and have not been performed.

H5 additionally needs `h5.esnextModules: ["animal-island-ui"]` so package CSS passes through pxtransform, and `<script><%= htmlWebpackPlugin.options.script %></script>` in the HTML template for the matching rem scale. Both are configured in the preview.
