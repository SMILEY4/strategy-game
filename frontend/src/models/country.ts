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

export namespace Country {
    // todo: remove `UNDEFINED`
    export const UNDEFINED: Country = {
        identifier: {
            id: "undefined",
            name: "undefined",
            color: Color.BLACK,
        },
        player: {
            userId: "undefined",
            name: "undefined",
        },
        settlers: null,
        provinces: [],
    };
}
