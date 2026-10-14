export interface SelectOption {
    key: string;
    label: string;
}
/** 以 key 为准，避免选项重排时提交旧索引对应的内容。 */
export function validKey(options: SelectOption[], key: string): string {
    return options.some((option) => option.key === key) ? key : (options[0]?.key ?? '');
}
export function filterOptions(
    options: SelectOption[],
    query: string,
    filter: boolean | ((input: string, option: SelectOption) => boolean),
    field: 'key' | 'label'
) {
    if (!query || filter === false) return options;
    return options.filter((option) =>
        typeof filter === 'function' ? filter(query, option) : option[field].toLowerCase().includes(query.toLowerCase())
    );
}
