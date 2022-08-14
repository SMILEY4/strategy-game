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
            gameId: string,
            position: {
                q: number,
                r: number
            },
            data: {
                terrainType: string
            },
            content: MsgTileContent[]
        })[],
        cities: ({
            cityId: string,
            countryId: string,
            tile: {
                tileId: string,
                q: number,
                r: number
            },
            name: string,
        })[]

    },
    errors: ({
        errorMessage: string,
    })[]
}