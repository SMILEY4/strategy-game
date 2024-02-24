export function isPresent<T>(value: T | null | undefined): boolean {
    return !(value === undefined || value === null);
}

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

export function getMaxOrDefault<T>(array: T[], value: (e: T) => number, defaultValue: T): T {
    let maxElement: T = defaultValue;
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


export function roundToPlaces(value: number, decPlaces: number): number {
    const fac = Math.pow(10, decPlaces);
    return Math.round(value * fac) / fac;
}

export function bitSet(num: number, bit: number) {
    return num | 1 << bit;
}

export function bitClear(num: number, bit: number) {
    return num & ~(1 << bit);
}

export function mapRecord<K extends keyof any, I, O>(record: Record<K, I>, transform: (key: K, value: I) => O): Record<K, O> {
    let transformed: Record<K, O> = {} as any;
    for (const [key, value] of Object.entries(record)) {
        transformed[key as K] = transform(key as K, value as I);
    }
    return transformed;
}

export function chooseRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export type BuildMapContent<V> = Record<string, V>

export function buildMap<K, V>(content: BuildMapContent<V>) {
    const map = new Map<string, V>();
    for (const [key, value] of Object.entries(content)) {
        map.set(key, value);
    }
    return map;
}