export function orDefault<T>(value: T | null | undefined, defaultValue: T): T {
    if (value == null || value == undefined) {
        return defaultValue;
    } else {
        return value;
    }
}

export function orNull<T>(value: T | null | undefined): T | null {
    if (value == null || value == undefined) {
        return null;
    } else {
        return value;
    }
}

export function generateId(): string {
    return crypto.randomUUID();
}


export function getMax<T>(array: T[], value: (e: T) => number): T | null {
    let maxElement: T | null = null;
    let maxValue = Number.MIN_VALUE;
    array.forEach(e => {
        const v = value(e);
        if (v > maxValue) {
            maxValue = v;
            maxElement = e;
        }
    });
    return maxElement;
}


export function getMin<T>(array: T[], value: (e: T) => number): T | null {
    let minElement: T | null = null;
    let minValue = Number.MAX_VALUE;
    array.forEach(e => {
        const v = value(e);
        if (v > minValue) {
            minValue = v;
            minElement = e;
        }
    });
    return minElement;
}