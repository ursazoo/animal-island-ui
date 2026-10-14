import type { PickerCallbacks } from './picker';

/** Observe actual scroll settlement, including wheel/trackpad input and touch inertia. */
export function mountPicker(id: string, callbacks: PickerCallbacks): () => void {
    let disposed = false;
    let frame = 0;
    let timer = 0;
    let detach = () => {};
    const attach = () => {
        if (disposed) return;
        const root = document.getElementById(id);
        const column = root?.querySelector<HTMLElement>('taro-picker-view-column-core');
        if (!root || !column) {
            frame = requestAnimationFrame(attach);
            return;
        }
        let active = false;
        let held = false;
        const start = () => {
            if (!active) {
                active = true;
                callbacks.onStart();
            }
        };
        const schedule = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(settle, 160);
        };
        const settle = () => {
            if (disposed || held || !active) return;
            const indicator = root.querySelector<HTMLElement>('.taro-picker-view-mask-indicator');
            const rows = Array.from(column.children).filter((row): row is HTMLElement => row instanceof HTMLElement);
            if (!indicator || !rows.length) return;
            const rect = indicator.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            let index = 0;
            let delta = Infinity;
            rows.forEach((row, i) => {
                const bounds = row.getBoundingClientRect();
                const distance = bounds.top + bounds.height / 2 - center;
                if (Math.abs(distance) < Math.abs(delta)) {
                    index = i;
                    delta = distance;
                }
            });
            if (Math.abs(delta) > 0.5) {
                column.scrollTo({ top: column.scrollTop + delta, behavior: 'smooth' });
                schedule();
                return;
            }
            window.clearTimeout(timer);
            active = false;
            callbacks.onChange(index);
            callbacks.onEnd();
        };
        const scroll = () => {
            start();
            schedule();
        };
        const touchStart = (event: TouchEvent) => {
            // Supersede Taro H5's touch-only 500ms timer; native browser scrolling is not prevented.
            event.stopImmediatePropagation();
            held = true;
            window.clearTimeout(timer);
            start();
        };
        const touchEnd = (event: TouchEvent) => {
            event.stopImmediatePropagation();
            held = false;
            schedule();
        };
        column.addEventListener('scroll', scroll, { passive: true });
        column.addEventListener('scrollend', settle);
        column.addEventListener('wheel', scroll, { passive: true });
        column.addEventListener('touchstart', touchStart, { capture: true, passive: true });
        column.addEventListener('touchend', touchEnd, { capture: true, passive: true });
        column.addEventListener('touchcancel', touchEnd, { capture: true, passive: true });
        detach = () => {
            column.removeEventListener('scroll', scroll);
            column.removeEventListener('scrollend', settle);
            column.removeEventListener('wheel', scroll);
            column.removeEventListener('touchstart', touchStart, true);
            column.removeEventListener('touchend', touchEnd, true);
            column.removeEventListener('touchcancel', touchEnd, true);
        };
    };
    attach();
    return () => {
        disposed = true;
        cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        detach();
    };
}
