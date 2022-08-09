import {MsgTileContent} from "./messagingTileContent";

export interface PayloadInitTurnState {
    game: {
        game: {
            turn: number,
            players: any,
        }
        countries: ({
            _key: string,
            userId: string,
            resources: {
                money: number
            }
        })[],
        tiles: ({
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
            gameId: string,
            tileId: string
        })[]

    },
    errors: ({
        errorMessage: string,
        command: any
    })[]
}