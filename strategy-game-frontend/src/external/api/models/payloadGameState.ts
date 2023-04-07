import {Color} from "../../../core/models/Color";
import {ResourceType} from "../../../core/models/resourceType";
import {TileVisibility} from "../../../core/models/tileVisibility";
import {MsgTileContent} from "./messagingTileContent";
import {ProductionQueueEntryDTO} from "./productionQueueEntryDTO";

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
            } | null,
            active: boolean
        })[],
        productionQueue: ProductionQueueEntryDTO[]
    })[],
    provinces: ({
        provinceId: string,
        countryId: string,
        cityIds: string[],
        provinceCapitalCityId: string,
        dataTier3: {
            resourceBalance: Record<ResourceType, number>
        } | null
    })[],
    routes: ({
        routeId: string,
        cityIdA: string,
        cityIdB: string,
        path: ({
            tileId: string,
            q: number,
            r: number
        })[]
    })[]
}
