export interface GameStateUpdate {
    game: {
        turn: number,
        tiles: ({
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
        })[]
        countries: ({
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
        })[],
        cities: ({
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
        })[],
        provinces: ({
            provinceId: string,
            countryId: string,
            cityIds: string[],
            provinceCapitalCityId: string,
            dataTier3: null | {
                resourceBalance: Map<string, number>
            }
        })[],
        routes: ({})[]
    };
}