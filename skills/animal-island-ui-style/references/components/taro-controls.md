# Taro API — first batch

Native props come from `@tarojs/components`, not HTML. Interfaces copied from source.

## Button

```ts
export interface ButtonProps extends Omit<NativeButtonProps, 'type' | 'size' | 'loading'> {
    /** 原库视觉类型 */
    type?: ButtonType;
    /** 原库视觉尺寸；small 通过外部热区达到 44px */
    size?: ButtonSize;
    /** 危险状态 */
    danger?: boolean;
    /** 透明背景 */
    ghost?: boolean;
    /** 撑满容器 */
    block?: boolean;
    /** 加载时阻止重复点击 */
    loading?: boolean;
    /** 图标内容 */
    icon?: React.ReactNode;
    /** submit/reset 对应 Taro formType */
    htmlType?: ButtonHTMLType;
}
```

## Card

```ts
export interface CardProps extends ViewProps {
    /** 卡片类型 */
    type?: CardType;
    /** 原库色板 */
    color?: CardColor;
    /** 原库点阵花纹 */
    pattern?: CardPattern;
    /** 移动端按压反馈，仅可操作卡片启用 */
    hoverable?: boolean;
}
```

## Input

```ts
export interface InputProps extends Omit<NativeInputProps, 'onInput' | 'className'> {
    /** 视觉尺寸 */
    size?: 'small' | 'middle' | 'large';
    /** 状态阴影，不受 shadow 控制 */
    status?: 'error' | 'warning';
    /** 默认无阴影 */
    shadow?: boolean;
    /** 显示常驻清除热区 */
    allowClear?: boolean;
    /** 前缀 */
    prefix?: React.ReactNode;
    /** 后缀 */
    suffix?: React.ReactNode;
    /** 外层类名 */
    className?: string;
    /** 直接返回字符串，不伪造 DOM 事件 */
    onChange?: (value: string) => void;
    /** 原生输入事件 */
    onInput?: NativeInputProps['onInput'];
    /** 先 onChange('') 再 onClear */
    onClear?: () => void;
    /** 清除按钮名称 */
    clearAriaLabel?: string;
}
```
