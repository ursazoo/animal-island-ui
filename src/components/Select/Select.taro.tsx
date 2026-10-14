import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { View, Button as NativeButton, Image, PickerView, PickerViewColumn } from '@tarojs/components';
import { Button } from '../Button/Button.taro';
import { Input } from '../Input/Input.taro';
import { Drawer } from '../Drawer/Drawer.taro';
import { validKey, filterOptions } from './selection';
import type { SelectOption } from './selection';
import { buttonA11y } from '../../taro/overlay';
import { cx } from '../../taro/shared';
import { pickerAdapter } from '../../taro/picker';
import arrow from '../../taro/assets/chevrondown.png';
import close from '../../taro/assets/close.png';
import check from '../../taro/assets/check.png';
import styles from './select.taro.module.less';
export type { SelectOption } from './selection';
export interface SelectProps {
    /** 选项 key 必须唯一且非空 */
    options: SelectOption[];
    /** 受控选中值，空字符串表示未选 */
    value: string;
    /** 仅确认或清除时通知 */
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
    onClear?: () => void;
    clearAriaLabel?: string;
    /** 搜索使用抽屉列表，普通选择使用滚轮 */
    showSearch?: boolean;
    filterOption?: boolean | ((input: string, option: SelectOption) => boolean);
    optionFilterProp?: 'key' | 'label';
    onSearch?: (value: string) => void;
    notFoundContent?: React.ReactNode;
    /** 抽屉标题兼作触发器名称 */
    title?: string;
    className?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
}
export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onChange,
    placeholder = '请选择',
    disabled = false,
    allowClear = false,
    onClear,
    clearAriaLabel = '清除选择',
    showSearch = false,
    filterOption = true,
    optionFilterProp = 'label',
    onSearch,
    notFoundContent = '暂无数据',
    title = '请选择',
    className,
    ...aria
}) => {
    const pickerId = 'animal-picker-' + useId().replace(/:/g, '');
    const h5Picker = process.env.TARO_ENV === 'h5' && !!pickerAdapter.mount;
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(() => validKey(options, value));
    const [search, setSearch] = useState('');
    const [rolling, setRolling] = useState(false);
    const busy = useRef(false);
    const pending = useRef(false);
    const endTimer = useRef<ReturnType<typeof setTimeout>>();
    const revision = JSON.stringify(options);
    const [wheelEpoch, setWheelEpoch] = useState(0);
    const previousValue = useRef(value);
    const committed = useRef(false);
    const visible = filterOptions(options, search, filterOption, optionFilterProp);
    const effective = validKey(visible, draft);
    const index = Math.max(
        0,
        visible.findIndex((option) => option.key === effective)
    );
    const wheelValue = useMemo(() => [index], [index]);
    const selected = options.find((option) => option.key === value);
    const finish = () => {
        clearTimeout(endTimer.current);
        busy.current = false;
        pending.current = false;
        setRolling(false);
    };
    const dismiss = () => {
        committed.current = true;
        setOpen(false);
        finish();
        setSearch('');
        if (search) onSearch?.('');
    };
    useEffect(() => {
        const external = previousValue.current !== value;
        previousValue.current = value;
        setDraft((current) => validKey(options, external ? value : current));
        // Remount on option revisions: discard in-flight native events for the previous wheel.
        setWheelEpoch((epoch) => epoch + 1);
        clearTimeout(endTimer.current);
        busy.current = false;
        setRolling(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, revision]);
    useEffect(() => {
        if (!open || showSearch || !h5Picker || !options.length) return;
        return pickerAdapter.mount?.(pickerId, {
            onStart: () => {
                busy.current = true;
                setRolling(true);
            },
            onChange: (position) => {
                const option = visible[position];
                if (option) setDraft(option.key);
            },
            onEnd: finish,
        });
        // Rebind whenever the wheel/options are replaced; draft changes do not remount the scroller.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, showSearch, h5Picker, pickerId, wheelEpoch, revision]);
    useEffect(() => () => clearTimeout(endTimer.current), []);
    useEffect(() => {
        if (disabled && open) dismiss(); /* callbacks use the current render */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled]);
    const start = () => {
        if (disabled) return;
        setDraft(validKey(options, value));
        setSearch('');
        finish();
        committed.current = false;
        setOpen(true);
    };
    const confirm = () => {
        if (!open || disabled || busy.current || committed.current || !visible.length || !effective) return;
        committed.current = true;
        onChange(effective);
        dismiss();
    };
    return (
        <View className={cx(styles.wrapper, disabled && styles.disabled, className)}>
            <View className={cx(styles.field, allowClear && !!value && !disabled && styles.hasClear)}>
                <NativeButton
                    {...buttonA11y(disabled)}
                    className={styles.trigger}
                    disabled={disabled || undefined}
                    ariaLabel={aria['aria-label'] ?? title}
                    aria-label={aria['aria-label'] ?? title}
                    aria-labelledby={aria['aria-labelledby']}
                    onClick={start}
                >
                    <View className={selected ? styles.value : styles.placeholder}>
                        {selected?.label ?? placeholder}
                    </View>
                    <Image src={arrow} className={styles.arrow} />
                </NativeButton>
                {allowClear && value && !disabled && (
                    <NativeButton
                        {...buttonA11y()}
                        className={styles.clear}
                        ariaLabel={clearAriaLabel}
                        aria-label={clearAriaLabel}
                        onClick={() => {
                            onChange('');
                            onClear?.();
                        }}
                    >
                        <Image src={close} className={styles.clearIcon} />
                    </NativeButton>
                )}
            </View>
            <Drawer
                open={open}
                title={title}
                onClose={dismiss}
                footer={
                    <>
                        <Button onClick={dismiss}>取消</Button>
                        <Button
                            type="primary"
                            disabled={!open || rolling || !visible.length || disabled}
                            onClick={confirm}
                        >
                            确定
                        </Button>
                    </>
                }
            >
                {open && (
                    <>
                        {showSearch ? (
                            <>
                                <Input
                                    ariaLabel="搜索选项"
                                    aria-label="搜索选项"
                                    placeholder="输入关键词搜索"
                                    value={search}
                                    allowClear
                                    onChange={(text) => {
                                        setSearch(text);
                                        onSearch?.(text);
                                    }}
                                />
                                <View className={styles.options}>
                                    {visible.map((option) => (
                                        <NativeButton
                                            {...buttonA11y()}
                                            key={option.key}
                                            className={cx(styles.choice, effective === option.key && styles.chosen)}
                                            hoverClass={styles.choicePressed}
                                            ariaLabel={option.label}
                                            ariaSelected={effective === option.key}
                                            onClick={() => setDraft(option.key)}
                                        >
                                            <View className={styles.choiceLabel}>{option.label}</View>
                                            <Image
                                                src={check}
                                                className={cx(
                                                    styles.choiceCheck,
                                                    effective !== option.key && styles.checkHidden
                                                )}
                                            />
                                        </NativeButton>
                                    ))}
                                </View>
                            </>
                        ) : (
                            visible.length > 0 && (
                                <>
                                    <PickerView
                                        {...(process.env.TARO_ENV === 'h5'
                                            ? {
                                                  tabIndex: 0,
                                                  role: 'spinbutton',
                                                  'aria-label': title,
                                                  'aria-valuemin': 1,
                                                  'aria-valuemax': visible.length,
                                                  'aria-valuenow': index + 1,
                                                  'aria-valuetext': visible[index]?.label,
                                                  onKeyDown: (event: React.KeyboardEvent) => {
                                                      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                                                      event.preventDefault();
                                                      if (busy.current) return;
                                                      const next = Math.max(
                                                          0,
                                                          Math.min(
                                                              visible.length - 1,
                                                              index + (event.key === 'ArrowDown' ? 1 : -1)
                                                          )
                                                      );
                                                      setDraft(visible[next].key);
                                                  },
                                              }
                                            : {})}
                                        id={pickerId}
                                        key={wheelEpoch}
                                        className={styles.wheel}
                                        value={wheelValue}
                                        indicatorClass={styles.indicator}
                                        maskClass={styles.wheelMask}
                                        immediateChange={false}
                                        onPickStart={() => {
                                            if (h5Picker) return;
                                            clearTimeout(endTimer.current);
                                            busy.current = true;
                                            pending.current = false;
                                            setRolling(true);
                                        }}
                                        onChange={(event) => {
                                            if (h5Picker) return;
                                            const option = visible[event.detail.value[0]];
                                            if (option) setDraft(option.key);
                                        }}
                                        onPickEnd={() => {
                                            if (h5Picker) return;
                                            pending.current = true;
                                            endTimer.current = setTimeout(() => {
                                                if (pending.current) {
                                                    busy.current = false;
                                                    setRolling(false);
                                                }
                                            }, 50);
                                        }}
                                    >
                                        <PickerViewColumn className={styles.column}>
                                            {visible.map((option) => (
                                                <View className={styles.wheelItem} key={option.key}>
                                                    {option.label}
                                                </View>
                                            ))}
                                        </PickerViewColumn>
                                    </PickerView>
                                </>
                            )
                        )}
                        {!visible.length && <View className={styles.notFound}>{notFoundContent}</View>}
                    </>
                )}
            </Drawer>
        </View>
    );
};
Select.displayName = 'Select';
