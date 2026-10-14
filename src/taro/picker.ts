export interface PickerCallbacks {
    onStart: () => void;
    onChange: (index: number) => void;
    onEnd: () => void;
}
/** H5 scrolling is installed explicitly; native PickerView keeps its own event handling. */
export const pickerAdapter: {
    mount?: (id: string, callbacks: PickerCallbacks) => () => void;
} = {};
