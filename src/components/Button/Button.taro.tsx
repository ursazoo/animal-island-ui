import React, { useContext } from 'react';
import { PairedActions } from '../../taro/action-row';
import { Button as NativeButton, View, Image } from '@tarojs/components';
import type { ButtonProps as NativeButtonProps } from '@tarojs/components';
import type { ButtonType, ButtonSize, ButtonHTMLType } from './Button.types';
import { buttonA11y } from '../../taro/overlay';
import { cx } from '../../taro/shared';
import donut from '../../taro/assets/donut.png';
import styles from './button.taro.module.less';
export type { ButtonType, ButtonSize, ButtonHTMLType } from './Button.types';
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
export const Button: React.FC<ButtonProps> = ({
    type = 'default',
    size = 'middle',
    danger = false,
    ghost = false,
    block = false,
    loading = false,
    disabled = false,
    icon,
    htmlType = 'button',
    children,
    className,
    onClick,
    ...rest
}) => {
    const paired = useContext(PairedActions);
    return (
        <NativeButton
            {...rest}
            {...buttonA11y(disabled || loading)}
            formType={htmlType === 'button' ? rest.formType : htmlType}
            disabled={disabled || loading || undefined}
            hoverClass={styles.pressed}
            className={cx(
                styles.btn,
                paired && styles.paired,
                styles[`btn-${type}`],
                styles[`btn-${size}`],
                danger && styles['btn-danger'],
                ghost && styles['btn-ghost'],
                block && styles['btn-block'],
                loading && styles['btn-loading'],
                disabled && styles.disabled,
                className
            )}
            onClick={(e) => {
                if (!disabled && !loading) onClick?.(e);
            }}
        >
            {loading ? (
                <Image className={cx(styles.icon, styles['btn-loading-icon'])} src={donut} mode="aspectFit" />
            ) : (
                icon && <View className={styles['btn-icon']}>{icon}</View>
            )}
            {children}
        </NativeButton>
    );
};
Button.displayName = 'Button';
