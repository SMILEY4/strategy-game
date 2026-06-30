import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export interface Chunk {
    center: HexPosition
    tileIndices: number[]
}
