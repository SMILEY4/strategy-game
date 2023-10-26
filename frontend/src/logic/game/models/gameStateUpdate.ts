export interface GameStateUpdate {
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
        userId: string,
        userName: string,
        color: {
            red: number,
            green: number,
            blue: number,
        }
    },
    dataTier3: null | {
        availableSettlers: number
    }
}

export interface ProvinceDTO {
    dataTier1: {
        id: string,
        name: string,
        countryId: string,
        color: {
            red: number,
            green: number,
            blue: number,
        }
        cityIds: string[],
        provinceCapitalCityId: string,
    },
    dataTier3: null | {
        resourceBalance: Map<string, number>
    }
}

export interface CityDTO {
    cityId: string,
    countryId: string,
    tier: string,
    tile: {
        tileId: string,
        q: number,
        r: number,
    },
    name: string,
    color: {
        red: number,
        green: number,
        blue: number,
    },
    isProvinceCapital: boolean,
    buildings: ({
        type: string,
        tile: null | {
            tileId: string,
            q: number,
            r: number,
        },
        active: boolean
    })[],
    productionQueue: ({
        type: string,
        entryId: string,
        progress: number,
        buildingType: null | "FARM" | "WOODCUTTER"
    })[],
    size: number,
    growthProgress: number,
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