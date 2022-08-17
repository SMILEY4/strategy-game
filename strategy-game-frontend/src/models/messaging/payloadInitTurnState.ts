import {MsgTileContent} from "./messagingTileContent";

export interface PayloadInitTurnState {
    game: {
        turn: number,
        countries: ({
            countryId: string,
            userId: string,
            resources: {
                money: number
            }
        })[],
        tiles: ({
            tileId: string,
            position: {
                q: number,
                r: number
            },
            data: {
                terrainType: string
            },
            influences: ({
                countryId: string,
                value: number,
                sources: ({
                    provinceId: string,
                    cityId: string,
                    value: number
                })[]
            })[],
            owner: ({
                countryId: string,
                provinceId: string,
                cityId: string
            }) | null,
            content: MsgTileContent[]
        })[],
        cities: ({
            cityId: string,
            countryId: string,
            provinceId: string,
            tile: {
                tileId: string,
                q: number,
                r: number
            },
            name: string,
        })[],
        provinces: ({
            provinceId: string,
            countryId: string,
        })[]
    },
    errors: ({
        errorMessage: string,
    })[]
}