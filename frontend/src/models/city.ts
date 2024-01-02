import {CountryIdentifier} from "./country";
import {ProvinceIdentifier} from "./province";
import {TileIdentifier} from "./tile";
import {Color} from "./color";
import {SettlementTier} from "./settlementTier";
import {InfoVisibility} from "./infoVisibility";
import {ProductionQueueEntry, ProductionQueueEntryView} from "./productionQueueEntry";
import {CreateCityCommand} from "./command";
import {Building} from "./building";
import {DetailLogEntry} from "./detailLogEntry";

export interface CityIdentifier {
    id: string,
    name: string,
    color: Color
}

export interface CityReduced {
    identifier: CityIdentifier;
    isCountryCapitol: boolean; // todo: remove
    isProvinceCapitol: boolean;
    isPlanned?: boolean,
    createCommand?: CreateCityCommand
}

export interface City {
    identifier: CityIdentifier;
    country: CountryIdentifier;
    province: ProvinceIdentifier;
    tile: TileIdentifier,
    isCountryCapital: boolean; // todo
    isProvinceCapital: boolean;
    tier: SettlementTier,
    population: {
        size: number | null,
        progress: number | null,
        growthDetails: DetailLogEntry<PopulationGrowthDetailType>[]
    }
    buildings: Building[]
    productionQueue: ProductionQueueEntry[],
}

export type PopulationGrowthDetailType =
    "MORE_FOOD_AVAILABLE"
    | "NOT_ENOUGH_FOOD"
    | "STARVING"
    | "PROVINCE_CAPITAL"
    | "MAX_SIZE_REACHED"

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
        growthDetails: DetailLogEntry<PopulationGrowthDetailType>[]
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
    connectedCities: ConnectedCityView[]
}

export interface ConnectedCityView {
    routeId: string,
    city: CityIdentifier,
    routeLength: number
}
