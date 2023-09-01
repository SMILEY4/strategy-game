import {ProvinceReduced} from "./province";

export interface CountryIdentifier {
    id: string,
    name: string,
}

export interface Country {
    identifier: CountryIdentifier;
    playerName: string,
    settlers: number,
    provinces: ProvinceReduced[];
}

export namespace Country {
    export const UNDEFINED: Country = {
        identifier: {
            id: "undefined",
            name: "undefined",
        },
        playerName: "undefined",
        settlers: 0,
        provinces: [],
    };
}