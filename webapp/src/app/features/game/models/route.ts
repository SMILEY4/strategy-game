import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export interface Route {
    id: number,
    from: number,
    to: number,
    cost: number,
    path: (HexPosition & { id: number })[]
}
