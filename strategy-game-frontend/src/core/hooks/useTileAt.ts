import {WorldStore} from "../../external/state/world/worldStore";
import {Tile} from "../models/tile";
import {TilePosition} from "../models/tilePosition";
import {orNull} from "../../shared/utils";

export function useTileAt(pos: TilePosition | null): Tile | null {
    return orNull(WorldStore.useState(state => state.tiles.find(t => t.position.q === pos?.q && t.position.r === pos?.r)));
}