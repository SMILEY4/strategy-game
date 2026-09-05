import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";

export interface RenderEntity {
    id: number,
    owner: number | null,
    position: ExtendedHexPosition,
    renderType: "settlement",
    isPending: boolean
}
