import {GameStore} from "../../external/state/game/gameStore";
import {TilePosition} from "../../models/state/tilePosition";

export function useSelectedTilePosition(): TilePosition | null {
    return GameStore.useState(state => state.tileSelected);
}