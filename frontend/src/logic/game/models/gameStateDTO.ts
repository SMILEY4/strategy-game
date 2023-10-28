import {SettlementTierString} from "../../../models/settlementTier";
import {BuildingTypeString} from "../../../models/buildingType";
import {ResourceTypeString} from "../../../models/resourceType";

export interface GameStateDTO {
    game: {
        turn: number,
        tiles: TileDTO[]
        countries: CountryDTO[],
        provinces: ProvinceDTO[],
        cities: CityDTO[]
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
        resourceBalance: Record<ResourceTypeString, number>
    }
}

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
    }
}

export interface BuildingDTO {
    type: BuildingTypeString,
    tile: null | {
        tileId: string,
        q: number,
        r: number,
    },
    active: boolean
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
        visibility: "UNKNOWN" | "DISCOVERED" | "VISIBLE"
    },
    dataTier1: null | {
        terrainType: string,
        resourceType: string,
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
        content: ({
            type: "marker" | "scout",
            countryId: string | null,
            turn: number | null,
        })[]
    }
}

export interface ColorDTO {
    red: number,
    green: number,
    blue: number,
}