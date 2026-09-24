import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export type RealmColor = [number, number, number];

export interface Realm {
    id: number,
    color: RealmColor,
    owned: boolean,
    phase: "FOUNDING" | "ESTABLISHED",
    spawnLocation: HexPosition,
}
