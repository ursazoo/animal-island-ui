import React from 'react';
import { RootPortal } from '@tarojs/components';
export interface OverlayAdapter {
    Portal: React.ComponentType<{ children?: React.ReactNode }>;
    buttonProps?: (disabled?: boolean) => Record<string, unknown>;
    mount?: (id: string, close: () => void, isTop: () => boolean) => () => void;
}
/** 平台实现由独立 H5 入口注册；小程序依赖图不包含 react-dom。 */
export const overlayAdapter: OverlayAdapter = { Portal: RootPortal };
export const OverlayParent = React.createContext<string | undefined>(undefined);
export const buttonA11y = (disabled = false) => overlayAdapter.buttonProps?.(disabled) ?? {};
let stack: string[] = [];
const parents = new Map<string, string | undefined>();
const listeners = new Set<() => void>();
export const overlayStore = {
    subscribe(listener: () => void) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    snapshot: () => stack,
    add(id: string, parent?: string) {
        parents.set(id, parent);
        const next = stack.filter((item) => item !== id);
        const childIndex = next.findIndex((item) => {
            let ancestor = parents.get(item);
            while (ancestor) {
                if (ancestor === id) return true;
                ancestor = parents.get(ancestor);
            }
            return false;
        });
        next.splice(childIndex < 0 ? next.length : childIndex, 0, id);
        stack = next;
        listeners.forEach((fn) => fn());
    },
    remove(id: string) {
        parents.delete(id);
        stack = stack.filter((item) => item !== id);
        listeners.forEach((fn) => fn());
    },
    isTop: (id: string) => stack.at(-1) === id,
};
