import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";
import type {HiddenType} from "@app/features/game/models/hidden-type.ts";

export interface Tile {
    id: string,
    position: ExtendedHexPosition,
    visibility: "VISIBLE" | "DISCOVERED" | "UNDISCOVERED"
    world: HiddenType<{
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
    }>
    createCapital: {
        allowed: boolean
    }
    meta: {
        seed: number,
    }
}
