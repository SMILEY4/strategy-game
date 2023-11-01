import {CountryIdentifier} from "./country";
import {ProvinceIdentifier} from "./province";
import {TileIdentifier} from "./tile";
import {Color} from "./color";
import {SettlementTier} from "./settlementTier";
import {BuildingType} from "./buildingType";
import {InfoVisibility} from "./infoVisibility";
import {ProductionQueueEntry, ProductionQueueEntryView} from "./productionQueueEntry";

export interface CityIdentifier {
    id: string,
    name: string,
    color: Color
}

export interface CityReduced {
    identifier: CityIdentifier;
    isCountryCapitol: boolean;
    isProvinceCapitol: boolean;
    isPlanned?: boolean,
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
        remainingSlots: number,
        items: Building[]
    },
    productionQueue: {
        visibility: InfoVisibility,
        items: ProductionQueueEntryView[]
    },
}
