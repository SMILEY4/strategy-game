import {ProvinceReduced} from "./province";
import {PlayerIdentifier} from "./player";
import {Color} from "./color";
import {InfoVisibility} from "./infoVisibility";

export interface CountryIdentifier {
    id: string,
    name: string,
    color: Color,
}

export interface Country {
    identifier: CountryIdentifier;
    player: PlayerIdentifier,
    settlers: number | null,
    provinces: ProvinceReduced[];
}

export interface CountryView {
    isPlayerOwned: boolean,
    identifier: CountryIdentifier;
    player: PlayerIdentifier,
    settlers: {
        visibility: InfoVisibility,
        value: number,
        modifiedValue: number | null
    }
    provinces: {
        visibility: InfoVisibility,
        items: ProvinceReduced[]
    };
}
