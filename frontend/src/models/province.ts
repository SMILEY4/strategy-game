import {CountryIdentifier} from "./country";
import {CityReduced} from "./city";

export interface ProvinceIdentifier {
    id: string,
    name: string,
}

export interface Province {
    identifier: ProvinceIdentifier;
    country: CountryIdentifier;
    cities: CityReduced[];
}

export interface ProvinceReduced {
    identifier: ProvinceIdentifier,
    cities: CityReduced[],
}

export namespace Province {
    export const UNDEFINED: Province = {
        identifier: {
            id: "undefined",
            name: "undefined",
        },
        country: {
            id: "undefined",
            name: "undefined",
        },
        cities: [],
    };
}
