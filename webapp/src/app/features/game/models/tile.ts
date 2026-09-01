import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";
import type {HiddenType} from "@app/features/game/models/hidden-type.ts";

export interface Tile {
    id: number,
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
    political: HiddenType<{
        control: ({
            realm: number,
            entity: number,
            amount: number
        })[]
    }>
    createSettlement: {
        // first
        firstAvailable?: boolean,
        firstValidLocation?: boolean,
        firstValidRealm?: boolean,
        // after first
        available?: boolean,
        validLocation?: boolean,
        validRealm?: boolean,
    }
    meta: {
        seed: number,
    }
}
