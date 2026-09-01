import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export interface Realm {
    id: number,
    owned: boolean,
    phase: "FOUNDING" | "ESTABLISHED",
    spawnLocation: HexPosition,
}
