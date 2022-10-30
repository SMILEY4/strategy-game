export function when<T, R>(value: T, ...cases: WhenCase<T, R>[]): R {
    const matchingCase = cases.find(c => c.expected === value);
    if (matchingCase) {
        return matchingCase.callback();
    } else {
        throw new Error("no matching when-case for value '" + value + "'");
    }
}

export function whenCase<T, R>(expected: T, callback: () => R): WhenCase<T, R> {
    return {
        expected: expected,
        callback: callback
    };
}

export interface WhenCase<T, R> {
    expected: T,
    callback: () => R
}