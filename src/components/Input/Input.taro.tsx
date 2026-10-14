import React, { useContext, useState } from 'react';
import { View, Input as NativeInput, Button, Image } from '@tarojs/components';
import type { InputProps as NativeInputProps } from '@tarojs/components';
import { buttonA11y, OverlayParent } from '../../taro/overlay';
import { cx } from '../../taro/shared';
import close from '../../taro/assets/close.png';
import styles from './input.taro.module.less';
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
export const Input: React.FC<InputProps> = ({
    value,
    defaultValue = '',
    size = 'middle',
    status,
    shadow = false,
    allowClear = false,
    prefix,
    suffix,
    className,
    onChange,
    onInput,
    onClear,
    clearAriaLabel = '清除输入',
    disabled = false,
    ...rest
}) => {
    const overlayParent = useContext(OverlayParent);
    const [inner, setInner] = useState(defaultValue);
    const current = value ?? inner;
    const update = (next: string) => {
        if (value === undefined) setInner(next);
        onChange?.(next);
    };
    return (
        <View
            className={cx(
                styles.wrapper,
                styles[`wrapper-${size}`],
                !shadow && styles['wrapper-no-shadow'],
                status && styles[`wrapper-${status}`],
                disabled && styles['wrapper-disabled'],
                className
            )}
        >
            {prefix && <View className={styles.prefix}>{prefix}</View>}
            <NativeInput
                {...rest}
                adjustPosition={rest.adjustPosition ?? !overlayParent}
                value={current}
                disabled={disabled || undefined}
                className={styles.input}
                placeholderClass={styles.placeholder}
                cursorSpacing={rest.cursorSpacing ?? 24}
                onInput={(e) => {
                    if (disabled) return;
                    update(e.detail.value);
                    onInput?.(e);
                }}
            />
            {allowClear && current && !disabled && (
                <Button
                    {...buttonA11y()}
                    className={styles.clear}
                    ariaLabel={clearAriaLabel}
                    aria-label={clearAriaLabel}
                    onClick={() => {
                        update('');
                        onClear?.();
                    }}
                >
                    <Image src={close} className={styles.icon} />
                </Button>
            )}
            {suffix && <View className={styles.suffix}>{suffix}</View>}
        </View>
    );
};
Input.displayName = 'Input';
