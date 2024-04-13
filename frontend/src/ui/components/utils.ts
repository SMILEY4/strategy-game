export function joinClassNames(classNames: (string | null | undefined)[]): string | undefined {
    const usableNames = classNames.filter(e => !!e);
    if (usableNames) {
        return usableNames.join(" ");
    } else {
        return undefined;
    }
}

/**
 * @param value value usually between 0 and 1
 * @param addPlus whether to add a plus in front of positive percentage values
 */
export function formatPercentage(value: number, addPlus: boolean): string {
    const percValue = value * 100;
    const shortValue = Math.round(percValue * 100) / 100;
    if (addPlus && shortValue > 0) {
        return "+" + shortValue + "%";
    } else {
        return "" + shortValue + "%";
    }
}

export function formatNumber(value: number, addPlus: boolean, addPlusZero: boolean): string {
    if (addPlus && value > 0) {
        return "+" + value;
    } else if(addPlusZero && value === 0) {
        return "+" + value;
    } else {
        return "" + value;
    }
}