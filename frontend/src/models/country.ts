import {ProvinceReduced} from "./province";
import {PlayerIdentifier} from "./player";
import {Color} from "./color";

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

export namespace Country {
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