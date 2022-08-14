import {MsgTileContent} from "./messagingTileContent";

export interface PayloadInitGameState {
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
                value: number
            })[],
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
    };
}
