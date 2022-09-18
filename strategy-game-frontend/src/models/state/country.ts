import {Color} from "./Color";

export interface Country {
    countryId: string,
    userId: string,
    color: Color,
    advancedData: CountryAdvancedData | null
}

export interface CountryAdvancedData {
    resources: {
        money: number
    },
}