# Taro project (fork only)

Only Button, Card, Input, bottom Drawer and single Select are implemented.
Use Taro 4.3 + React 18 and the packed fork, not the upstream npm release.

```tsx
import { Button, Card, Input, Drawer, Select } from 'animal-island-ui/taro';
import 'animal-island-ui/taro/style';
if (process.env.TARO_ENV === 'h5') {
    require('animal-island-ui/taro/h5').installH5Adapter();
    require('animal-island-ui/taro/fonts');
}
```

Set `designWidth: 375` and `deviceRatio: {375:2,640:1.17,750:1,828:0.905}`.
A different app design width needs a per-package width mapping. Fonts for WeChat must be
loaded via `Taro.loadFontFace` from your HTTPS font server; do not import browser font CSS into weapp.
No font host means system fallback, not visual acceptance.

The H5 adapter is required for portals, focus, keyboard activation, scroll locks and Picker wheel/trackpad/touch settlement. Confirmation waits until the visible row is centered and its key synchronized.
Input onChange returns a string, not a Web event. Taro native props replace HTML attributes.
Select is controlled: unique nonempty keys, draft on open, explicit confirm, cancel discards,
clear calls onChange('') before onClear. Ordinary Select uses a wheel; search uses a drawer list.
Drawer only supports bottom placement; no background push or drag dismissal in this batch.

Reuse package styles, tokens and original PNG icon assets; do not import naive-icons React SVG
components into weapp. Card stays shadowless; primary Button stays cream with a brown stack except in paired Drawer actions, where all buttons share the same soft shadow and no vertical hover/press offset. Single footer actions retain the original stack.
Use the exported declaration files as the API authority. See [controls](components/taro-controls.md)
and [selection/overlays](components/taro-selection.md) for exact interfaces.

Upstream components not exported by the Taro entry remain unavailable. H5 screenshots and weapp
builds do not prove native keyboard, safe areas, wheel inertia or WeChat font fidelity.

H5 additionally needs `h5.esnextModules: ["animal-island-ui"]` so package CSS passes through pxtransform, and `<script><%= htmlWebpackPlugin.options.script %></script>` in the HTML template for the matching rem scale. Both are configured in the preview.

Mobile Select uses touch scrolling without previous/next buttons or confirmation hints. Its internal PickerView uses the original warm-white background and pale mint selection tokens; the surrounding Drawer stays cream.
Drawer footer actions fill the row (equal widths for two actions); the close image is 32px within a 44px target.

Drawer height is bounded to 40%–75% of the viewport (subject to available keyboard space). Its fixed footer has an opaque background, top spacing and a soft upward shadow. Search rows keep stable label/check slots during selection.
