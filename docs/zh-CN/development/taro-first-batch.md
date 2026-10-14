# Taro 第一批组件

此 fork 通过 `animal-island-ui/taro` 提供 **Button、Card、Input、底部 Drawer、单选 Select**。
默认入口仍为原来的 Web 库。这是 38 个可迁移模块中的首批 5 个，不代表整个库已支持移动端。
改造遵循 [Taro UI 改造标准](taro-ui-adaptation-standard.md)。

## 安装与使用

使用 Taro 4.3 + React 18。此 fork 尚未发布到 npm。在仓库中运行：

```sh
npm ci
npm run preview:prepare
```

prepare 会构建库、执行 `npm pack`，将 `.tgz` 安装到独立消费者 `examples/taro`，然后执行消费者类型检查、H5 和微信小程序构建。
其他项目应显式安装生成的 `examples/taro/vendor/animal-island-ui-2.2.1.tgz`。
版本号保留上游基线，具体 fork 构建由压缩包完整性标识区分。直接安装上游 npm 版本不会得到本次新增入口。

```tsx
import { Button, Card, Input, Drawer, Select } from 'animal-island-ui/taro';
import 'animal-island-ui/taro/style';

// App 入口：编译期分支确保 DOM 辅助和大字体文件不进入 weapp。
if (process.env.TARO_ENV === 'h5') {
    require('animal-island-ui/taro/h5').installH5Adapter();
    require('animal-island-ui/taro/fonts');
}
```

H5 适配器负责浮层挂载、焦点、键盘操作和页面滚动锁，必须在 H5 初始化。
它是库的一部分，预览页面没有自建替代组件。

样式以 375 设计宽度的逻辑像素编写，消费者配置：

```ts
designWidth: 375,
deviceRatio: { 375: 2, 640: 1.17, 750: 1, 828: 0.905 },
```

使用其他设计宽度的项目，需要用 Taro 的 `designWidth(input)` 对此库样式单独匹配宽度。
不能直接把 375 宽度的库样式按 750 设计稿转换。

## 组件约定

- **Button：** 保留 type/size/danger/ghost/block/loading，接受原生 Taro 按钮属性。
  `htmlType` 的 submit/reset 映射为 `formType`。加载和禁用时阻止操作。
- **Card：** 保留 color/pattern/type。`hoverable` 开启触摸反馈；有点击行为的 H5 卡片支持键盘。
  只读卡片默认不产生操作反馈。
- **Input：** 接受 Taro 输入框属性及 `value`/`defaultValue`，支持前后缀、清除、阴影和错误/警告状态。
  `onChange(value: string)` 与 Web 的 DOM 事件不同；`onInput` 返回原生 Taro 事件。
  清除时先调用 `onChange('')`，再调用 `onClear()`。
- **Drawer：** 支持受控 `open`、`title`、`onClose`、`footer`、`maskClosable=true`、CSS 字符串 `height`、
  `className`、`ariaLabel`。首批仅 `placement='bottom'`，不声称支持背景下沉、其他方向、拖拽关闭和任意遮罩样式。
  高度限制为屏幕的 40%–75%（键盘打开时受剩余空间约束）。内容区可滚动，顶部保留 8px，并设置 24px 滚动留白，让聚焦后的整个输入框及外侧焦点线保持可见；底部固定操作区有不透明底色、16px 顶部间距和向上柔和阴影，预留安全区；支持层叠关闭，H5 Escape/Tab/焦点恢复及滚动锁。
  微信端使用 RootPortal 并根据键盘高度调整位置。
- **Select：** 受控 `options: {key,label}[]`、`value: string`、`onChange(key)`；key 必须唯一且非空。
  普通模式为内嵌 PickerView，搜索模式为过滤列表。打开时建立草稿，确认提交，取消/遮罩/关闭丢弃。
  无效值展示第一项但不自动回写；空选项禁用确认。重排保留 key，删除当前项后修正到第一项，外部值更新优先。
  支持 `allowClear`、`onClear`、`clearAriaLabel`、`showSearch`、`filterOption`、`optionFilterProp`、
  `onSearch`、`notFoundContent`、`title`、`className`、`aria-label`、`aria-labelledby`。
  直接触摸滚动 PickerView，不显示上一项/下一项按钮或确认提示文案。H5 通过强制停靠与独立适配器处理触摸惯性、鼠标滚轮和触控板；显示项居中且 key 同步后才恢复确认。H5 聚焦滚轮后也可用上下方向键选择。

准确属性以包中声明文件为准，并同步到 Skill 的 Taro 专用参考。Web 事件处理函数需要按 Taro 值/事件约定调整。

## 美术风格保持方式

Taro 样式直接导入对应组件的原 Less。Select 触发器使用原版 mixin；内部 PickerView 使用原库暖白底色和 10% 透明度薄荷绿选中条，选中条左右各留 12px，上下遮罩同步使用暖白色；外层抽屉保留奶油色。
主按钮仍为奶油色和棕色 5px 底部厚阴影；抽屉多个按钮平铺时统一为相同轻阴影，并取消 hover/按压的垂直偏移，使可见轮廓对齐，单按钮保留原厚底；Card 不加阴影，Input 默认无阴影。
移动端有意调整：Input 最小可见高度 44px、小按钮外扩热区、清除/关闭按钮 44px 热区、Drawer 标题 24px、正文 16px、底部安全区。
主题变量从同一份 Less 源生成到 `page` 和 `:root`。

PNG 图标从 `naive-icons@1.6.0`（MIT）以 3 倍尺寸导出，保留原画，避免 Web SVG React 组件进入小程序。
运行 `node scripts/generate-taro-icons.mjs` 可重新生成。

H5 字体单独按需引入，复制原库 woff2 文件。微信需通过 `Taro.loadFontFace` 从已配置的 HTTPS 字体服务器加载相同字体；
浏览器字体不会进入小程序包。构建示例时设置 `ANIMAL_FONT_BASE` 可验证该路径。
未设置时，示例明确显示系统回退字体，不能据此认定微信端视觉一致性已通过。

抽屉操作按钮平铺整行：双按钮等宽，单按钮占满。关闭图标为 32px，触摸区域保持 44px。

## 预览和验证

- `examples/taro/src/pages/index/index.tsx`：实际组件展示、组合表单及 39 模块状态目录。
- `examples/taro/preview.html`：桌面预览框、320/375/414 切换及原版对照，复制到 H5 产物旁使用。
- `examples/web-baseline/main.tsx`：原版 Web 对照，根目录 `npm run dev` 可启动。
- `npm run test:run`：原 Web 回归/无障碍测试及 Taro 状态、浮层生命周期测试。
- `node scripts/verify-taro-package.mjs`：追踪打包后的 Taro JS/声明依赖，核对原生模板、包大小，确保不引入 Web/图标运行时代码和浏览器字体。
- `node scripts/verify-taro-browser.mjs`：对 localhost:4173 执行真实 H5 操作，检查宽度、确认/取消/搜索/表单、键盘、嵌套浮层及滚动恢复。
  本次 Moli 导航超时后显式改用本机 Google Chrome；`ANIMAL_QA_OUTPUT` 可指定证据目录。

浏览器测试与微信编译成功不能代替微信开发者工具和 iOS/Android 真机验收。
原生键盘、读屏、安全区、字体服务器和原生滚轮惯性仍需设备验证。
项目负责人已于 2026-10-14 验收通过首批 H5 预览。源码在 fork 的 `feat/taro-first-batch` 分支维护；npm 发布和网站部署属于独立步骤，尚未执行。

H5 还需配置 `h5.esnextModules: ["animal-island-ui"]`，让包样式经过 pxtransform；HTML 模板加入 `<script><%= htmlWebpackPlugin.options.script %></script>` 以使用匹配的 rem 比例，示例已包含这两项。
