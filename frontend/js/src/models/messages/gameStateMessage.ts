import {HiddenType} from "../../common/hiddenType";

export interface GameStateMessage {
    game: {
        turn: number
    },
    tiles: TileMessage[],
    realms: RealmMessage[],
    worldObjects: WorldObjectMessage[],
    routes: RouteMessage[]
}

export type VisibilityMsg = "UNKNOWN" | "DISCOVERED" | "VISIBLE"

export type TerrainTypeMsg = "LAND" | "WATER"

export type ResourceTypeMsg =
    | "RAW_WOOD"
    | "RAW_FISH"
    | "RAW_STONE"
    | "RAW_METAL"
    | "TIMBER"
    | "FOOD"
    | "STONE"
    | "METAL"

export type WorldObjectTypeGroupMsg = "unit" | "tile-improvement" | "settlement"

export interface TileMessage {
    identifier: {
        id: string,
        q: number,
        r: number
    },
    visibility: VisibilityMsg
    base: HiddenType<{
        terrainType: TerrainTypeMsg,
        height: number,
        resources: ({
            type: ResourceTypeMsg,
            amount: number,
            maxAmount: number,
            changeRate: number,
            canDeplete: boolean,
        })[],
    }>,
    metaProperties: {
        seed: number
    }
}

export interface RealmMessage {
    id: string,
    name: string,
    color: {
        red: number,
        green: number,
        blue: number,
    }
    player: {
        userId: string,
        name: string
    },
    ownedByUser: boolean
}

export interface RouteMessage {
    id: string,
    cost: number,
    worldObjectA: HiddenType<string>,
    worldObjectB: HiddenType<string>,
    path: ({
        id: string,
        q: number,
        r: number
    })[]
}

export interface WorldObjectMessage {
    id: string,
    type: {
        group: WorldObjectTypeGroupMsg,
        name: string,
    },
    realm: {
        id: string,
        name: string,
    },
    tile: {
        id: string,
        q: number,
        r: number
    },
    components: (
        | MoveWorldObjectComponentMessage
        | VisionWorldObjectComponentMessage
        | BuilderWorldObjectComponentMessage
        | SettlementSpawnerWorldObjectComponentMessage
        | RouteNodeComponentMessage
        | EconomyComponentMessage
        | ProductionComponentMessage
        )[],
}


interface MoveWorldObjectComponentMessage {
    type: "movement";
    maxMovement: number;
}


interface VisionWorldObjectComponentMessage {
    type: "vision";
    radius: number;
}

interface BuilderWorldObjectComponentMessage {
    type: "builder";
    maxUses: number;
    remainingUses: number;
    options: ({
        type: string,
        available: boolean
    })[];
}

interface SettlementSpawnerWorldObjectComponentMessage {
    type: "settlementSpawner";
}

interface RouteNodeComponentMessage {
    type: "routeNode";
}

interface EconomyComponentMessage {
    type: "economy";
    storage: Record<string, number>,
    entries: ({
        name: string,
        active: boolean,
    })[]
    log: ({
        logType: string,
        entryName: string,
        resourceType: string,
        amount: number,
    })[]
}

interface ProductionComponentMessage {
    type: "production";
    queue: ({
        type: "scout" | "worker",
        progress: number
    })[]
}