import {Color} from "./Color";
import {ResourceValue} from "./resourceValue";

export interface Country {
    countryId: string,
    userId: string,
    color: Color,
    dataTier3: CountryDataTier3 | null
}

export interface CountryDataTier3 {
    resources: {
        money: ResourceValue,
        wood: ResourceValue,
        food: ResourceValue,
        stone: ResourceValue,
        metal: ResourceValue
    },
}