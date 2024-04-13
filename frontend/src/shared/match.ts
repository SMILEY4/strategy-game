export type MatchCase<V, T> = [V, () => T]

export function match<V, T>(value: V, ...cases: MatchCase<V, T>[]): T {
    for (let i = 0; i < cases.length; i++) {
        const c = cases[i];
        if (c[0] === value) {
            return c[1]();
        }
    }
    throw new Error("no case matched value " + value);
}