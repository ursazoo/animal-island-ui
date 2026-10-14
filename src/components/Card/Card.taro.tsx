import React from 'react';
import { View } from '@tarojs/components';
import type { ViewProps } from '@tarojs/components';
import type { CardType, CardColor, CardPattern } from './Card.types';
import { buttonA11y } from '../../taro/overlay';
import { cx } from '../../taro/shared';
import styles from './card.taro.module.less';
export type { CardType, CardColor, CardPattern } from './Card.types';
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
export const Card: React.FC<CardProps> = ({
    type = 'default',
    color = 'default',
    pattern = 'none',
    hoverable = false,
    className,
    children,
    ...rest
}) => (
    <View
        {...rest}
        {...(rest.onClick ? buttonA11y() : {})}
        hoverClass={hoverable ? styles.pressed : 'none'}
        className={cx(
            styles.card,
            type === 'dashed' && styles['card-dashed'],
            color !== 'default' && styles[`card-${color}`],
            pattern !== 'none' && styles[`pattern-${pattern}`],
            className
        )}
    >
        {children}
    </View>
);
Card.displayName = 'Card';
