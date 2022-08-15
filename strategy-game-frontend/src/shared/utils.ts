export function orDefault<T>(value: T | null | undefined, defaultValue: T): T {
    if (value == null || value == undefined) {
        return defaultValue;
    } else {
        return value;
    }
}