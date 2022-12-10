import {Color} from "../../../core/models/Color";
import {ResourceType} from "../../../core/models/resourceType";
import {TileVisibility} from "../../../core/models/tileVisibility";
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
                provinceId: string
                cityId: string | null
            }) | null,
        } | null,
        dataTier2: {
            influences: ({
                countryId: string,
                provinceId: string,
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
        }
    })[],
    cities: ({
        cityId: string,
        countryId: string,
        tile: {
            tileId: string,
            q: number,
            r: number
        },
        isProvinceCapital: boolean,
        name: string,
        color: Color,
        buildings: ({
            type: string,
            tile: {
                tileId: string,
                q: number,
                r: number
            } | null
        })[]
    })[],
    provinces: ({
        provinceId: string,
        countryId: string,
        cityIds: string[],
        provinceCapitalCityId: string,
        dataTier3: {
            resourceBalance: {
                ARMOR: number,
                BARRELS: number,
                CLOTHES: number,
                FOOD: number,
                HIDE: number,
                HORSE: number,
                JEWELLERIES: number,
                METAL: number,
                PARCHMENT: number,
                STONE: number,
                TOOLS: number,
                WEAPONS: number,
                WINE: number,
                WOOD: number,
            }
        } | null
    })[]
}
