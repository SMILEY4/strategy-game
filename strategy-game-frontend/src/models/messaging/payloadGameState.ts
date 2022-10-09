import {Color} from "../state/Color";
import {TileVisibility} from "../state/tileVisibility";
import {MsgTileContent} from "./messagingTileContent";

export interface PayloadGameState {
    turn: number,
    tiles: ({
        dataTier0: {
            tileId: string,
            position: {
                q: number,
                r: number
            },
            visibility: TileVisibility
        },
        dataTier1: {
            terrainType: string,
            resourceType: string,
            owner: ({
                countryId: string,
                cityId: string
            }) | null,
        } | null,
        dataTier2: {
            influences: ({
                countryId: string,
                cityId: string,
                amount: number
            })[],
            content: MsgTileContent[]
        } | null
    })[],
    countries: ({
        dataTier1: {
            countryId: string,
            userId: string,
            color: Color
        },
        dataTier3: {
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
        color: Color,
        city: boolean,
        parentCity: string | null
    })[]
}
