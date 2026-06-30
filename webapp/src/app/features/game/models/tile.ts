import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export interface Tile {
    id: string,
    position: HexPosition,
    chunk: HexPosition
}
