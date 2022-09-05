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
                provinceId: string,
                cityId: string
            }) | null,
        } | null,
        advancedData: {
            influences: ({
                countryId: string,
                value: number,
                sources: ({
                    provinceId: string,
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
            userId: string
        },
        advancedData: {
            resources: {
                money: number
            }
        } | null
    })[],
    provinces: ({
        provinceId: string,
        countryId: string
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
        name: string
    })[]
}
