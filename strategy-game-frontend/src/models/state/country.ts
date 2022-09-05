export interface Country {
    countryId: string,
    userId: string,
    color: CountryColor,
    advancedData: CountryAdvancedData | null
}

export interface CountryAdvancedData {
    resources: {
        money: number
    },
}

export enum CountryColor {
    RED = "red",
    GREEN = "green",
    BLUE = "blue",
    CYAN = "cyan",
    MAGENTA = "magenta",
    YELLOW = "yellow",
}

export const ALL_COUNTRY_COLORS = [
    CountryColor.RED, CountryColor.BLUE, CountryColor.GREEN, CountryColor.MAGENTA, CountryColor.CYAN, CountryColor.YELLOW
];