import {ProvinceReduced} from "./province";

export interface CountryIdentifier {
    id: string,
    name: string,
}

export interface Country {
    identifier: CountryIdentifier;
    userId: string,
    playerName: string,
    settlers: number, // todo: nullable ?
    provinces: ProvinceReduced[];
}

export namespace Country {
    export const UNDEFINED: Country = {
        identifier: {
            id: "undefined",
            name: "undefined",
        },
        userId: "undefined",
        playerName: "undefined",
        settlers: 0,
        provinces: [],
    };
}