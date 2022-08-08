import {MsgTileContent} from "./messagingTileContent";

export interface PayloadInitGameState {
    game: {
        game: {
            _key: string,
            turn: number,
            players: any,
        },
        countries: any,
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
            tileId: string
        })[]
    };
}
