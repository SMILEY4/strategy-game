import type {HexPosition} from "@app/features/game/models/hex-position.ts";

/** A tile entity from the server game state. */
export interface Tile {
    id: string,
    position: HexPosition,
    chunk: HexPosition
}
