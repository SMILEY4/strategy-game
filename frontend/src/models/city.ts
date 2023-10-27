import {CountryIdentifier} from "./country";
import {ProvinceIdentifier} from "./province";
import {TileIdentifier} from "./tile";
import {Color} from "./color";
import {SettlementTier} from "./settlementTier";
import {BuildingType} from "./buildingType";

export interface CityIdentifier {
    id: string,
    name: string,
    color: Color
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
    isCountryCapital: boolean;
    isProvinceCapital: boolean;
    tier: SettlementTier,
    population: {
        size: number | null,
        progress: number | null
    }
    buildings: Building[]
    productionQueue: ProductionQueueEntry[],
}

export interface Building {
    type: BuildingType,
    active: boolean,
    tile: TileIdentifier | null,
}

export interface ProductionQueueEntry {
    id: string,
    progress: number,
    type: "building" | "settler",
    buildingData: null | {
        type: BuildingType
    },
    settlerData: null | {}
}

export interface ProductionEntry {
    type: "building" | "settler",
    disabled: boolean,
    icon: string,
    buildingData: null | {
        type: BuildingType
    },
    settlerData: null | {}
}

export namespace City {
    export const UNDEFINED: City = {
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
        province: {
            id: "undefined",
            name: "undefined",
            color: Color.BLACK,
        },
        tile: {
            id: "undefined",
            q: 0,
            r: 0,
        },
        isCountryCapital: false,
        isProvinceCapital: false,
        tier: SettlementTier.VILLAGE,
        population: {
            size: 0,
            progress: 0,
        },
        productionQueue: [],
        buildings: [],
    };
}