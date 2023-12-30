import {SettlementTierString} from "../../../models/settlementTier";
import {BuildingTypeString} from "../../../models/buildingType";
import {ResourceTypeString} from "../../../models/resourceType";
import {TerrainTypeString} from "../../../models/terrainType";
import {VisibilityString} from "../../../models/visibility";
import {TerrainResourceTypeString} from "../../../models/terrainResourceType";
import {BuildingDetailType} from "../../../models/building";
import {PopulationGrowthDetailType} from "../../../models/city";

export interface GameStateDTO {
    game: {
        turn: number,
        tiles: TileDTO[]
        countries: CountryDTO[],
        provinces: ProvinceDTO[],
        cities: CityDTO[]
        routes: RouteDTO[]
    };
}

export interface CountryDTO {
    dataTier1: {
        id: string,
        name: string,
        color: ColorDTO
        userId: string,
        userName: string,
    },
    dataTier3: null | {
        availableSettlers: number
    }
}

export interface ProvinceDTO {
    dataTier1: {
        id: string,
        name: string,
        color: ColorDTO
        countryId: string,
        cityIds: string[],
        provinceCapitalCityId: string,
    },
    dataTier3: null | {
        resourceLedger: ResourceLedgerDTO
    }
}

export interface ResourceLedgerDTO {
    entries: ResourceLedgerEntryDTO[];
}

export interface ResourceLedgerEntryDTO {
    resourceType: ResourceTypeString,
    amount: number,
    missing: number,
    details: DetailLogEntryDTO<ResourceLedgerDetailTypeDTO>[]
}

export type  ResourceLedgerDetailTypeDTO = "UNKNOWN_CONSUMPTION"
    | "UNKNOWN_PRODUCTION"
    | "UNKNOWN_MISSING"
    | "BUILDING_CONSUMPTION"
    | "BUILDING_PRODUCTION"
    | "BUILDING_MISSING"
    | "POPULATION_BASE_CONSUMPTION"
    | "POPULATION_BASE_MISSING"
    | "POPULATION_GROWTH_CONSUMPTION"
    | "POPULATION_GROWTH_MISSING"
    | "PRODUCTION_QUEUE_CONSUMPTION"
    | "PRODUCTION_QUEUE_MISSING"
    | "PRODUCTION_QUEUE_REFUND"
    | "SHARED_GIVE"
    | "SHARED_TAKE"


export interface CityDTO {
    dataTier1: {
        id: string,
        name: string,
        color: ColorDTO,
        countryId: string,
        isCountryCapital: boolean,
        isProvinceCapital: boolean,
        tile: {
            tileId: string,
            q: number,
            r: number,
        },
        tier: SettlementTierString
    },
    dataTier3: null | {
        buildings: BuildingDTO[],
        productionQueue: ProductionQueueEntryDTO[],
        size: number,
        growthProgress: number,
        growthDetails: DetailLogEntryDTO<PopulationGrowthDetailType>[]
    }
}

export interface BuildingDTO {
    type: BuildingTypeString,
    tile: null | {
        tileId: string,
        q: number,
        r: number,
    },
    active: boolean,
    details: DetailLogEntryDTO<BuildingDetailType>[]
}

export interface ProductionQueueEntryDTO {
    entryId: string,
    progress: number,
    type: "building" | "settler",
    buildingType: null | BuildingTypeString
}

export interface TileDTO {
    dataTier0: {
        tileId: string,
        position: {
            q: number,
            r: number
        },
        visibility: VisibilityString
    },
    dataTier1: null | {
        terrainType: TerrainTypeString,
        resourceType: "NONE" | TerrainResourceTypeString,
        owner: null | {
            countryId: string,
            provinceId: string,
            cityId: string | null
        }
    },
    dataTier2: null | {
        influences: ({
            countryId: string,
            provinceId: string,
            cityId: string,
            amount: number
        })[],
        objects: TileObjectDTO[]
    }
}

export interface TileObjectDTO {
    type: "marker" | "scout" | "city",
    countryId: string
}

export interface MarkerTileObjectDTO extends TileObjectDTO{
    type: "marker"
}

export interface ScoutTileObjectDTO extends TileObjectDTO{
    type: "scout"
    creationTurn: number
}

export interface CityTileObjectDTO extends TileObjectDTO{
    type: "city",
    cityId: string
}

export interface RouteDTO {
    routeId: string,
    cityIdA: string,
    cityIdB: string,
    path: ({
        tileId: string,
        q: number,
        r: number,
    })[]
}

export interface ColorDTO {
    red: number,
    green: number,
    blue: number,
}


export interface DetailLogEntryDTO<T> {
    id: T,
    data: Record<string, DetailValueDTO>
}

export interface DetailValueDTO {
    type: string,
    value: any
}