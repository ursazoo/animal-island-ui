import { createPortal } from 'react-dom';
import { pickerAdapter } from './picker';
import { mountPicker } from './picker.h5';
import { overlayAdapter, overlayStore } from './overlay';
let lockCount = 0;
let scrollLocks: { element: HTMLElement; overflow: string }[] = [];
/** 仅 H5 app 入口调用，使用条件 require 确保不会进入 weapp 包。 */
export function installH5Adapter() {
    pickerAdapter.mount = mountPicker;
    overlayAdapter.buttonProps = (disabled = false) => ({
        role: 'button',
        tabIndex: disabled ? -1 : 0,
        'aria-disabled': disabled,
        onKeyDown: (event: KeyboardEvent) => {
            if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                (event.currentTarget as HTMLElement).click();
            }
        },
    });
    overlayAdapter.Portal = ({ children }) => createPortal(children, document.body);
    overlayAdapter.mount = (id, close, isTop) => {
        const oldFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        if (lockCount++ === 0) {
            scrollLocks = [document.body, ...document.querySelectorAll<HTMLElement>('.taro_page')].map((element) => ({
                element,
                overflow: element.style.overflow,
            }));
            scrollLocks.forEach(({ element }) => {
                element.style.overflow = 'hidden';
            });
        }
        const getPanel = () => document.getElementById(id);
        const focusable = () =>
            Array.from(
                getPanel()?.querySelectorAll<HTMLElement>(
                    'button:not(:disabled),input:not(:disabled),[tabindex="0"]'
                ) ?? []
            ).filter((el) => el.getClientRects().length > 0);
        const timer = window.setTimeout(() => {
            if (isTop()) (focusable()[0] ?? getPanel())?.focus();
        }, 50);
        const onKey = (event: KeyboardEvent) => {
            if (!isTop()) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
            }
            if (event.key === 'Tab') {
                const elements = focusable();
                const first = elements[0];
                const last = elements.at(-1);
                if (!first) {
                    event.preventDefault();
                    getPanel()?.focus();
                } else if (
                    event.shiftKey &&
                    (document.activeElement === first || !getPanel()?.contains(document.activeElement))
                ) {
                    event.preventDefault();
                    last?.focus();
                } else if (
                    !event.shiftKey &&
                    (document.activeElement === last || !getPanel()?.contains(document.activeElement))
                ) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };
        const onFocus = (event: FocusEvent) => {
            if (isTop() && event.target instanceof Node && !getPanel()?.contains(event.target))
                (focusable()[0] ?? getPanel())?.focus();
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('focusin', onFocus);
        return () => {
            window.clearTimeout(timer);
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('focusin', onFocus);
            if (--lockCount === 0) {
                scrollLocks.forEach(({ element, overflow }) => {
                    element.style.overflow = overflow;
                });
                scrollLocks = [];
            }
            const top = overlayStore.snapshot().at(-1);
            if (oldFocus?.isConnected && (!top || document.getElementById(top)?.contains(oldFocus))) oldFocus.focus();
        };
    };
}
