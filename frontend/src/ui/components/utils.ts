export function joinClassNames(classNames: (string | null | undefined)[]): string | undefined {
    const usableNames = classNames.filter(e => !!e);
    if (usableNames) {
        return usableNames.join(" ");
    } else {
        return undefined;
    }
}

export function formatPercentage(value: number, addPlus: boolean): string {
    const percValue = value * 100;
    const shortValue = Math.round(percValue * 100) / 100;
    if (addPlus && shortValue > 0) {
        return "+" + shortValue + "%";
    } else {
        return "" + shortValue + "%";
    }
}