import {CountryIdentifier} from "./country";
import {CityReduced} from "./city";
import {Color} from "./color";
import {ResourceType} from "./resourceType";

export interface ProvinceIdentifier {
    id: string,
    name: string,
    color: Color,
}

export interface ProvinceReduced {
    identifier: ProvinceIdentifier,
    cities: CityReduced[],
}

export interface Province {
    identifier: ProvinceIdentifier;
    country: CountryIdentifier;
    cities: CityReduced[];
    resourceBalance: Map<ResourceType, number>
}

export namespace Province {
    export const UNDEFINED: Province = {
        identifier: {
            id: "undefined",
            name: "undefined",
            color: Color.BLACK,
        },
        country: {
            id: "undefined",
            name: "undefined",
            color: Color.BLACK,
        },
        cities: [],
        resourceBalance: new Map<ResourceType, number>()
    };
}
