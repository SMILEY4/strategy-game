import type {HexPosition} from "@app/features/game/models/hex-position.ts";

/** A chunk grouping tile indices under a center hex coordinate. */
export interface Chunk {
    center: HexPosition
    tileIndices: number[]
}
