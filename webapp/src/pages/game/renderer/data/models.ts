import type {Tile} from "@app/features/game/models/tile.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {Entity} from "@app/features/game/models/entity.ts";


export interface TileCollection {
    tiles: Tile[],
    revId: string
}

export interface EntityCollection {
    tiles: Entity[],
    revId: string
}

export type RenderCamera = Camera & { revId: string }