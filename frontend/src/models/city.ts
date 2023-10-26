import {CountryIdentifier} from "./country";
import {ProvinceIdentifier} from "./province";
import {ResourceBalance} from "./resource";
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
    resources: ResourceBalance[],
    productionQueue: ProductionQueueEntry[],
}

export interface ProductionQueueEntry {
    id: string,
    name: string,
    progress: number
}

export interface Building {
    type: BuildingType,
    active: boolean,
    tile: TileIdentifier | null,
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
            color: Color.BLACK
        },
        country: {
            id: "undefined",
            name: "undefined",
            color: Color.BLACK
        },
        province: {
            id: "undefined",
            name: "undefined",
            color: Color.BLACK
        },
        tile: {
            id: "undefined",
            q: 0,
            r: 0
        },
        isCountryCapital: false,
        isProvinceCapital: false,
        tier: SettlementTier.VILLAGE,
        population: {
            size: 0,
            progress: 0,
        },
        resources: [],
        productionQueue: [],
        buildings: [],
    };
}