import {CountryIdentifier} from "./country";
import {ProvinceIdentifier} from "./province";
import {TileIdentifier} from "./tile";
import {Color} from "./color";
import {SettlementTier} from "./settlementTier";
import {ProductionQueueEntry, ProductionQueueEntryView} from "./productionQueueEntry";
import {CreateCityCommand} from "./command";
import {Building} from "./building";
import {DetailLogEntry} from "./detailLogEntry";
import {HiddenType} from "./hiddenType";

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
    isPlayerOwned: boolean,
    isCountryCapital: boolean; // todo remove
    isProvinceCapital: boolean;
    tier: SettlementTier,
    population: {
        size: HiddenType<number>,
        growth: HiddenType<{
            progress: number,
            details: DetailLogEntry<PopulationGrowthDetailType>[]
        }>
    }
    buildings: HiddenType<Building[]>
    productionQueue: HiddenType<ProductionQueueEntry[]>,
    connectedCities: ConnectedCity[]
}

export interface ConnectedCity {
    city: CityIdentifier,
    route: string,
    distance: number
}

export type PopulationGrowthDetailType =
    "MORE_FOOD_AVAILABLE"
    | "NOT_ENOUGH_FOOD"
    | "STARVING"
    | "PROVINCE_CAPITAL"
    | "MAX_SIZE_REACHED"

export interface CityView {
    base: City,
    modified: {
        tier: SettlementTier | null,
        productionQueue: ProductionQueueEntryView[]
    }
}
