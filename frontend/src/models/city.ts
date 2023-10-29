import {CountryIdentifier} from "./country";
import {ProvinceIdentifier} from "./province";
import {TileIdentifier} from "./tile";
import {Color} from "./color";
import {SettlementTier} from "./settlementTier";
import {BuildingType} from "./buildingType";
import {InfoVisibility} from "./infoVisibility";

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

export interface CityView {
    isPlayerOwned: boolean,
    identifier: CityIdentifier;
    country: CountryIdentifier;
    province: ProvinceIdentifier;
    tile: TileIdentifier,
    isCountryCapital: boolean;
    isProvinceCapital: boolean;
    tier: {
        value: SettlementTier,
        modifiedValue: SettlementTier | null
    },
    population: {
        visibility: InfoVisibility,
        size: number,
        progress: number
    },
    buildings: {
        visibility: InfoVisibility,
        items: Building[]
    },
    productionQueue: {
        visibility: InfoVisibility,
        items: ProductionQueueEntry[]
    },
}