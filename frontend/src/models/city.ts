import {CountryIdentifier} from "./country";
import {ProvinceIdentifier} from "./province";
import {ResourceBalance} from "./resource";
import {TileIdentifier} from "./tile";

export interface CityIdentifier {
    id: string,
    name: string,
}

export interface CityReduced {
    identifier: CityIdentifier;
    isCountryCapitol: boolean;
    isProvinceCapitol: boolean;
}

export interface City {
    identifier: CityIdentifier;
    country: CountryIdentifier;
    province: ProvinceIdentifier;
    tile: TileIdentifier,
    isCountryCapitol: boolean;
    isProvinceCapitol: boolean;
    population: {
        size: number,
        progress: number
    }
    resources: ResourceBalance[],
    productionQueue: ProductionQueueEntry[],
    maxContentSlots: number,
    content: CityContentEntry[]
}

export interface ProductionQueueEntry {
    id: string,
    name: string,
    progress: number
}

export interface CityContentEntry {
    icon: string;
}

export interface ProductionEntry {
    name: "SETTLER" | "FARM" | "WOODCUTTER",
    icon: string,
    disabled: boolean,
}

export namespace City {
    export const UNDEFINED: City = {
        identifier: {
            id: "undefined",
            name: "undefined",
        },
        country: {
            id: "undefined",
            name: "undefined",
        },
        province: {
            id: "undefined",
            name: "undefined",
        },
        tile: {
            id: "undefined",
            q: 0,
            r: 0
        },
        isCountryCapitol: false,
        isProvinceCapitol: false,
        population: {
            size: 0,
            progress: 0,
        },
        resources: [],
        productionQueue: [],
        maxContentSlots: 0,
        content: [],
    };
}