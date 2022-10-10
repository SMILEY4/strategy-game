import {Color} from "./Color";

export interface Country {
    countryId: string,
    userId: string,
    color: Color,
    dataTier3: CountryDataTier3 | null
}

export interface CountryDataTier3 {
    resources: {
        money: number,
        wood: number,
        food: number,
        stone: number,
        metal: number
    },
}