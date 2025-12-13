import {Tile} from "../../../models/tile/tile";
import {TileSummary} from "../../../models/tile/tileSummary";
import {usePartialSingletonEntity} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";

export function useSelectedTile(): TileSummary | null {
    return usePartialSingletonEntity(App.gameSessionDatabase, e => e.selectedTile);
}