# Taro API — first batch

Native props come from `@tarojs/components`, not HTML. Interfaces copied from source.

## Drawer

```ts
export interface DrawerProps {
    /** 受控打开状态 */
    open: boolean;
    /** 标题 */
    title?: React.ReactNode;
    /** 关闭请求 */
    onClose?: () => void;
    /** 是否可点遮罩关闭 */
    maskClosable?: boolean;
    /** 首批仅支持底部 */
    placement?: 'bottom';
    /** CSS 长度；随内容在屏幕 40%–75% 内，键盘打开时不超过剩余可视区域 */
    height?: string;
    /** 固定底部操作区 */
    footer?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    /** 无文字标题时必填可访问名称 */
    ariaLabel?: string;
}
```

## Select

```ts
export interface SelectProps {
    /** 选项 key 必须唯一且非空 */
    options: SelectOption[];
    /** 受控选中值，空字符串表示未选 */
    value: string;
    /** 仅确认或清除时通知 */
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    onClear?: () => void;
    clearAriaLabel?: string;
    /** 搜索使用抽屉列表，普通选择使用滚轮 */
    showSearch?: boolean;
    filterOption?: boolean | ((input: string, option: SelectOption) => boolean);
    optionFilterProp?: 'key' | 'label';
    onSearch?: (value: string) => void;
    notFoundContent?: React.ReactNode;
    /** 抽屉标题兼作触发器名称 */
    title?: string;
    className?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
}
```
