import type {Tile} from "@app/features/game/models/tile.ts";
import type {Camera} from "@app/features/game/models/camera.ts";


export interface TileCollection {
    tiles: Tile[],
    revId: string
}

export type RenderCamera = Camera & { revId: string }