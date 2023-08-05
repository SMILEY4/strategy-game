export function joinClassNames(classNames: (string | null | undefined)[]): string | undefined {
    const usableNames = classNames.filter(e => !!e);
    if (usableNames) {
        return usableNames.join(" ");
    } else {
        return undefined;
    }
}