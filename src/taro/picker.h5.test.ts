import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountPicker } from './picker.h5';

function fixture() {
    document.body.innerHTML = `<div id="picker"><taro-picker-view-column-core><div>A</div><div>B</div><div>C</div></taro-picker-view-column-core><div class="taro-picker-view-mask-indicator"></div></div>`;
    const column = document.querySelector<HTMLElement>('taro-picker-view-column-core')!;
    const rect = (top: number) => ({ top, height: 48 }) as DOMRect;
    document.querySelector<HTMLElement>('.taro-picker-view-mask-indicator')!.getBoundingClientRect = () => rect(96);
    Array.from(column.children).forEach((row, index) => {
        row.getBoundingClientRect = () => rect(96 + index * 48 - column.scrollTop);
    });
    column.scrollTo = vi.fn();
    const events = { onStart: vi.fn(), onChange: vi.fn(), onEnd: vi.fn() };
    const dispose = mountPicker('picker', events);
    return { column, events, dispose };
}

describe('H5 picker scroll settlement', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        document.body.innerHTML = '';
    });
    it('wheel movement stays busy until the displayed row actually reaches the indicator center', () => {
        const { column, events, dispose } = fixture();
        column.dispatchEvent(new WheelEvent('wheel'));
        column.scrollTop = 28;
        column.dispatchEvent(new Event('scroll'));
        vi.advanceTimersByTime(160);
        expect(events.onStart).toHaveBeenCalledTimes(1);
        expect(column.scrollTo).toHaveBeenCalledWith({ top: 48, behavior: 'smooth' });
        expect(events.onChange).not.toHaveBeenCalled();
        expect(events.onEnd).not.toHaveBeenCalled();
        // The browser finishes the smooth snap, then publishes the displayed row.
        column.scrollTop = 48;
        column.dispatchEvent(new Event('scrollend'));
        expect(events.onChange).toHaveBeenCalledWith(1);
        expect(events.onEnd).toHaveBeenCalledTimes(1);
        dispose();
    });
    it('touch hold does not submit; cancellation settles without Taro’s competing touch timer', () => {
        const { column, events, dispose } = fixture();
        const upstream = vi.fn();
        column.addEventListener('touchend', upstream);
        column.dispatchEvent(new Event('touchstart'));
        column.scrollTop = 96;
        column.dispatchEvent(new Event('scroll'));
        vi.advanceTimersByTime(1000);
        expect(events.onEnd).not.toHaveBeenCalled();
        column.dispatchEvent(new Event('touchcancel'));
        vi.advanceTimersByTime(160);
        expect(events.onChange).toHaveBeenCalledWith(2);
        expect(events.onEnd).toHaveBeenCalledTimes(1);
        column.dispatchEvent(new Event('touchstart'));
        column.dispatchEvent(new Event('touchend'));
        expect(upstream).not.toHaveBeenCalled();
        dispose();
    });
    it('disposal removes listeners and cancels delayed settlement', () => {
        const { column, events, dispose } = fixture();
        column.dispatchEvent(new WheelEvent('wheel'));
        dispose();
        vi.advanceTimersByTime(1000);
        column.dispatchEvent(new Event('scroll'));
        expect(events.onStart).toHaveBeenCalledTimes(1);
        expect(events.onChange).not.toHaveBeenCalled();
        expect(events.onEnd).not.toHaveBeenCalled();
    });
});
