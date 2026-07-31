import type {HexPosition} from "@app/features/game/models/hex-position.ts";

/** A tile entity from the server game state. */
export interface Tile {
    id: string,
    position: HexPosition,
    chunk: HexPosition,
    world: {
        biome: string,
        elevation: string,
        feature: string,
        resources: ({
            type: string,
            amount: number,
            maxAmount: number,
            changeRate: number,
            removeOnDeplete: number
        })[]
    },
    meta: {
        seed: number,
    }
}
