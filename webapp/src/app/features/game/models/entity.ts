import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";

export interface Entity {
    id: string,
    owner: string,
    position: ExtendedHexPosition,
    components: (
        | { type: "player-spawn", radius: number }
        | { type: "settlement", isRealmCapital: boolean }
        )[]
}
