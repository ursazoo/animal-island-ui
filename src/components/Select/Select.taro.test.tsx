import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('@tarojs/taro', () => ({ default: { onKeyboardHeightChange: vi.fn(), offKeyboardHeightChange: vi.fn() } }));
vi.mock('@tarojs/components', () => ({
    View: ({
        children,
        ariaLabel,
        ariaRole,
        catchMove: _catchMove,
        hoverClass: _hoverClass,
        enhanced: _enhanced,
        showScrollbar: _showScrollbar,
        ...props
    }: any) => (
        <div {...props} aria-label={ariaLabel ?? props['aria-label']} role={ariaRole ?? props.role}>
            {children}
        </div>
    ),
    RootPortal: ({ children }: any) => <>{children}</>,
    ScrollView: ({
        children,
        scrollY: _scrollY,
        enhanced: _enhanced,
        showScrollbar: _showScrollbar,
        ...props
    }: any) => <div {...props}>{children}</div>,
    Button: ({
        children,
        ariaLabel,
        hoverClass: _hoverClass,
        formType: _formType,
        ariaSelected: _ariaSelected,
        ...props
    }: any) => (
        <button {...props} aria-label={ariaLabel ?? props['aria-label']}>
            {children}
        </button>
    ),
    Image: ({ src, className }: any) => <img src={src} className={className} alt="" />,
    Input: ({
        onInput,
        value,
        ariaLabel,
        placeholderClass: _placeholderClass,
        cursorSpacing: _cursorSpacing,
        ...props
    }: any) => (
        <input
            {...props}
            aria-label={ariaLabel ?? props['aria-label']}
            value={value}
            onChange={(e) => onInput({ detail: { value: e.target.value } })}
        />
    ),
    PickerView: ({ value, onChange, onPickStart, onPickEnd, children }: any) => (
        <div>
            <output data-testid="wheel-value">{value[0]}</output>
            <button onClick={() => onPickStart()}>start wheel</button>
            <button onClick={() => onChange({ detail: { value: [1] } })}>change wheel</button>
            <button onClick={() => onPickEnd()}>end wheel</button>
            {children}
        </div>
    ),
    PickerViewColumn: ({ children }: any) => <div>{children}</div>,
}));
import { Select } from './Select.taro';
const options = [
    { key: 'a', label: '苹果岛' },
    { key: 'b', label: '桃子岛' },
];
function open() {
    fireEvent.click(screen.getByRole('button', { name: '选择小岛' }));
}
function confirm() {
    fireEvent.click(screen.getByRole('button', { name: '确定' }));
}
describe('Taro Select commit contract', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());
    it('confirms the displayed first option without requiring a wheel change event', () => {
        const onChange = vi.fn();
        render(<Select title="选择小岛" options={options} value="" onChange={onChange} />);
        open();
        expect(screen.getByTestId('wheel-value')).toHaveTextContent('0');
        confirm();
        expect(onChange).toHaveBeenCalledExactlyOnceWith('a');
    });
    it('cancel discards draft and reopens with external value', () => {
        const onChange = vi.fn();
        render(<Select title="选择小岛" options={options} value="a" onChange={onChange} />);
        open();
        fireEvent.click(screen.getByText('change wheel'));
        fireEvent.click(screen.getByRole('button', { name: '取消' }));
        expect(onChange).not.toHaveBeenCalled();
        open();
        expect(screen.getByTestId('wheel-value')).toHaveTextContent('0');
    });
    it('blocks confirmation until wheel settles, then submits the current key exactly once', () => {
        const onChange = vi.fn();
        render(<Select title="选择小岛" options={options} value="a" onChange={onChange} />);
        open();
        fireEvent.click(screen.getByText('start wheel'));
        fireEvent.click(screen.getByText('change wheel'));
        confirm();
        expect(onChange).not.toHaveBeenCalled();
        fireEvent.click(screen.getByText('end wheel'));
        act(() => vi.advanceTimersByTime(60));
        confirm();
        expect(onChange).toHaveBeenCalledExactlyOnceWith('b');
    });
    it('keeps draft by key on reorder, repairs removed options, and gives external values priority', () => {
        const onChange = vi.fn();
        const { rerender } = render(<Select title="选择小岛" options={options} value="a" onChange={onChange} />);
        open();
        fireEvent.click(screen.getByText('change wheel'));
        rerender(<Select title="选择小岛" options={[...options].reverse()} value="a" onChange={onChange} />);
        expect(screen.getByTestId('wheel-value')).toHaveTextContent('0');
        rerender(<Select title="选择小岛" options={[...options].reverse()} value="b" onChange={onChange} />);
        expect(screen.getByTestId('wheel-value')).toHaveTextContent('0');
        rerender(<Select title="选择小岛" options={[options[0]]} value="b" onChange={onChange} />);
        confirm();
        expect(onChange).toHaveBeenCalledExactlyOnceWith('a');
    });
    it('cannot confirm a cancelled session during the exit transition', () => {
        const onChange = vi.fn();
        render(<Select title="选择小岛" options={options} value="a" onChange={onChange} />);
        open();
        fireEvent.click(screen.getByText('change wheel'));
        fireEvent.click(screen.getByRole('button', { name: '取消' }));
        confirm();
        expect(onChange).not.toHaveBeenCalled();
    });
    it('empty options cannot submit', () => {
        const onChange = vi.fn();
        render(<Select title="选择小岛" options={[]} value="" onChange={onChange} />);
        open();
        expect(screen.getByRole('button', { name: '确定' })).toBeDisabled();
        confirm();
        expect(onChange).not.toHaveBeenCalled();
    });
    it('clear is visible without hover and orders the callbacks', () => {
        const events: string[] = [];
        render(
            <Select
                title="选择小岛"
                options={options}
                value="a"
                allowClear
                onChange={(v) => events.push('change:' + v)}
                onClear={() => events.push('clear')}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: '清除选择' }));
        expect(events).toEqual(['change:', 'clear']);
    });
    it('disabled cannot open or clear', () => {
        render(<Select title="选择小岛" options={options} value="a" allowClear disabled onChange={vi.fn()} />);
        open();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '清除选择' })).not.toBeInTheDocument();
    });
    it('search filters, cancellation clears query, and reopen restores the full list', () => {
        const onSearch = vi.fn();
        const onChange = vi.fn();
        render(
            <Select title="选择小岛" options={options} value="a" showSearch onChange={onChange} onSearch={onSearch} />
        );
        open();
        fireEvent.change(screen.getByRole('textbox', { name: '搜索选项' }), { target: { value: '桃' } });
        expect(screen.queryByRole('button', { name: '苹果岛' })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: '取消' }));
        expect(onSearch.mock.calls).toEqual([['桃'], ['']]);
        expect(onChange).not.toHaveBeenCalled();
        open();
        expect(screen.getByRole('button', { name: '苹果岛' })).toBeInTheDocument();
    });
});
