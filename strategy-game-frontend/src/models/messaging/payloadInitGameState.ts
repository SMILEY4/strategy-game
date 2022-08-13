import {MsgTileContent} from "./messagingTileContent";

export interface PayloadInitGameState {
    game: {
        game: {
            _key: string,
            turn: number,
            players: any,
        },
        countries: ({
            _key: string,
            userId: string,
            resources: {
                money: number
            }
        })[],
        tiles: ({
            _key: string,
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
            _key: string,
            gameId: string,
            tile: {
                tileId: string,
                q: number,
                r: number
            },
            name: string,
        })[]
    };
}
