export const cx = (...values: (string | false | undefined)[]) => values.filter(Boolean).join(' ');
