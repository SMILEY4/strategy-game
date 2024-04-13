import {ProvinceReduced} from "./province";
import {PlayerIdentifier} from "./player";
import {Color} from "./color";
import {HiddenType} from "./hiddenType";
import {CityReduced} from "./city";

export interface CountryIdentifier {
    id: string,
    name: string,
    color: Color,
}

export interface Country {
    identifier: CountryIdentifier;
    player: PlayerIdentifier,
    isPlayerOwned: boolean,
    settlers: HiddenType<number>,
    provinces: ProvinceReduced[];
}

export interface CountryView {
    base: Country
    modified: {
        settlers: number | null,
        createdProvinces: ProvinceReduced[]
        createdCities: CityReduced[]
    }
}
