import type {RenderCameraData} from "@pages/game/renderer/data/models.ts";
import type {Tile} from "@app/features/game/models/tile.ts";

export interface GameRendererDataProvider {
    getTiles: () => Tile[]
    getCamera: () => RenderCameraData
}