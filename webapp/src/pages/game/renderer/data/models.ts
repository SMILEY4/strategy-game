import type {Tile} from "@app/features/game/models/tile.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {Entity} from "@app/features/game/models/entity.ts";
import type {Command} from "@app/features/game/models/command.ts";
import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";


export interface TileCollection {
    tiles: Tile[],
    revId: string
}

export interface EntityCollection {
    entities: Entity[],
    revId: string
}

export interface CommandCollection {
    commands: Command[],
    revId: string
}

export interface RenderEntity {
    id: number,
    owner: number | null,
    position: ExtendedHexPosition,
    renderType: "settlement",
    isPending: boolean
}

export type RenderCamera = Camera & { revId: string }
