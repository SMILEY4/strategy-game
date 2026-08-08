import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";
import type {HiddenType} from "@app/features/game/models/hidden-type.ts";

export interface Tile {
    id: string,
    position: ExtendedHexPosition,
    visibility: 0 | 1 | 2 // 0 = not discovered, 1 = discovered not visible, 2 = visible
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
    createSettlement: {
        allowed: boolean
    }
    meta: {
        seed: number,
    }
}
