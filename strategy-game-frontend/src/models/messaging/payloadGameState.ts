import {Color} from "../state/Color";
import {TileVisibility} from "../state/tileVisibility";
import {MsgTileContent} from "./messagingTileContent";

export interface PayloadGameState {
    turn: number,
    tiles: ({
        baseData: {
            tileId: string,
            position: {
                q: number,
                r: number
            },
            visibility: TileVisibility
        },
        generalData: {
            terrainType: string,
            owner: ({
                countryId: string,
                cityId: string
            }) | null,
        } | null,
        advancedData: {
            influences: ({
                countryId: string,
                value: number,
                sources: ({
                    cityId: string,
                    value: number
                })[]
            })[],
            content: MsgTileContent[]
        } | null
    })[],
    countries: ({
        baseData: {
            countryId: string,
            userId: string,
            color: Color
        },
        advancedData: {
            resources: {
                money: number
            }
        } | null
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
        color: Color
    })[]
}
