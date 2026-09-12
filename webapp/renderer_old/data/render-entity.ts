import type {ExtendedHexPosition} from "src/app/features/game/models/hex-position.ts";

export interface RenderEntity {
    id: number,
    owner: number | null,
    position: ExtendedHexPosition,
    renderType: "settlement" | "tile-improvement",
    isPending: boolean,
    tileImprovementType: string | null,
}
