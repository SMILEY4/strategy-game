import type {RenderCameraData} from "@pages/game/renderer/data/models.ts";
import type {Tile} from "@app/features/game/models/tile.ts";

/** Data provider interface for the game renderer, supplying tiles and camera state. */
export interface GameRendererDataProvider {
    getTiles: () => Tile[]
    getCamera: () => RenderCameraData
}