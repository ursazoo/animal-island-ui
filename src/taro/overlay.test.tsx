import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
vi.mock('@tarojs/components', () => ({ RootPortal: ({ children }: React.PropsWithChildren) => <>{children}</> }));
import { overlayStore, overlayAdapter } from './overlay';
import { installH5Adapter } from './h5';

afterEach(() => {
    for (const id of overlayStore.snapshot()) overlayStore.remove(id);
});
describe('Taro overlay lifecycle', () => {
    it('orders simultaneously mounted nested layers by parent, not effect order', () => {
        overlayStore.add('child', 'parent');
        overlayStore.add('parent');
        expect(overlayStore.snapshot()).toEqual(['parent', 'child']);
        expect(overlayStore.isTop('child')).toBe(true);
    });
    it('restores scroll locks even when an older layer closes first', () => {
        installH5Adapter();
        document.body.style.overflow = 'auto';
        const page = document.createElement('div');
        page.className = 'taro_page';
        page.style.overflow = 'scroll';
        document.body.append(page);
        const cleanA = overlayAdapter.mount!('a', vi.fn(), () => false);
        const cleanB = overlayAdapter.mount!('b', vi.fn(), () => true);
        cleanA();
        expect(document.body.style.overflow).toBe('hidden');
        expect(page.style.overflow).toBe('hidden');
        cleanB();
        expect(document.body.style.overflow).toBe('auto');
        expect(page.style.overflow).toBe('scroll');
        page.remove();
        document.body.style.overflow = '';
    });
    it('keeps H5 portals outside transformed application containers', () => {
        installH5Adapter();
        const Portal = overlayAdapter.Portal;
        const { container, unmount } = render(
            <div style={{ transform: 'scale(.9)' }}>
                <Portal>
                    <div role="dialog">内容</div>
                </Portal>
            </div>
        );
        expect(container.contains(screen.getByRole('dialog'))).toBe(false);
        expect(document.body.contains(screen.getByRole('dialog'))).toBe(true);
        act(() => unmount());
    });
});
