import React, { useContext, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { View, ScrollView, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { overlayAdapter, overlayStore, OverlayParent, buttonA11y } from '../../taro/overlay';
import { cx } from '../../taro/shared';
import close from '../../taro/assets/close.png';
import styles from './drawer.taro.module.less';
import { PairedActions } from '../../taro/action-row';

function countActions(children: React.ReactNode): number {
    return React.Children.toArray(children).reduce<number>((count, child) => {
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment) {
            return count + countActions(child.props.children);
        }
        return count + 1;
    }, 0);
}
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
export const Drawer: React.FC<DrawerProps> = ({
    open,
    title,
    onClose,
    maskClosable = true,
    height,
    footer,
    children,
    className,
    ariaLabel,
}) => {
    const parent = useContext(OverlayParent);
    const id = 'animal-drawer-' + useId().replace(/:/g, '');
    const callbacks = useRef({ onClose, maskClosable, open });
    callbacks.current = { onClose, maskClosable, open };
    const stack = useSyncExternalStore(overlayStore.subscribe, overlayStore.snapshot, overlayStore.snapshot);
    const [present, setPresent] = useState(open);
    const [visible, setVisible] = useState(false);
    const [keyboard, setKeyboard] = useState(0);
    useEffect(() => {
        if (open) {
            setPresent(true);
            const timer = setTimeout(() => setVisible(true), 20);
            return () => clearTimeout(timer);
        }
        setVisible(false);
        const timer = setTimeout(() => setPresent(false), 360);
        return () => clearTimeout(timer);
    }, [open]);
    useEffect(() => {
        if (!present) return;
        overlayStore.add(id, parent);
        const cleanup = overlayAdapter.mount?.(
            id,
            () => {
                if (callbacks.current.open) callbacks.current.onClose?.();
            },
            () => overlayStore.isTop(id)
        );
        return () => {
            overlayStore.remove(id);
            cleanup?.();
        };
    }, [present, id, parent]);
    useEffect(() => {
        if (!open || process.env.TARO_ENV === 'h5') return;
        const change = (e: { height: number }) => setKeyboard(e.height);
        Taro.onKeyboardHeightChange(change);
        return () => {
            Taro.offKeyboardHeightChange(change);
            setKeyboard(0);
        };
    }, [open]);
    if (!present) return null;
    const Portal = overlayAdapter.Portal;
    const top = stack.at(-1) === id;
    const dismiss = () => {
        if (open && overlayStore.isTop(id)) callbacks.current.onClose?.();
    };
    return (
        <OverlayParent.Provider value={id}>
            <Portal>
                <View
                    className={styles.host}
                    catchMove
                    style={{ zIndex: 1000 + Math.max(0, stack.indexOf(id)) * 2 }}
                    ariaHidden={!top}
                >
                    <View
                        className={cx(styles.mask, visible && styles.maskOpen)}
                        onClick={() => {
                            if (maskClosable) dismiss();
                        }}
                    />
                    <View
                        id={id}
                        className={cx(styles.panel, styles.panelBottom, visible && styles.panelOpen, className)}
                        style={{
                            height,
                            bottom: keyboard ? `${keyboard}px` : undefined,
                            minHeight: keyboard ? `min(40vh, calc(100% - ${keyboard}px - 16px))` : undefined,
                            maxHeight: keyboard ? `min(75vh, calc(100% - ${keyboard}px - 16px))` : undefined,
                        }}
                        ariaRole="dialog"
                        ariaLabel={ariaLabel ?? (typeof title === 'string' ? title : '对话框')}
                        {...{
                            role: 'dialog',
                            'aria-modal': true,
                            'aria-label': ariaLabel ?? (typeof title === 'string' ? title : '对话框'),
                            tabIndex: -1,
                        }}
                    >
                        <View className={styles.header}>
                            <View className={styles.title}>{title}</View>
                            <Button
                                {...buttonA11y(!open)}
                                className={styles.close}
                                ariaLabel="关闭"
                                aria-label="关闭"
                                onClick={dismiss}
                            >
                                <Image src={close} className={styles.icon} />
                            </Button>
                        </View>
                        <ScrollView scrollY className={styles.body} enhanced showScrollbar={false}>
                            <View className={styles.content}>{children}</View>
                        </ScrollView>
                        {footer && (
                            <PairedActions.Provider value={countActions(footer) > 1}>
                                <View className={styles.footer}>{footer}</View>
                            </PairedActions.Provider>
                        )}
                    </View>
                </View>
            </Portal>
        </OverlayParent.Provider>
    );
};
Drawer.displayName = 'Drawer';
