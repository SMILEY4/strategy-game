import {Tile} from "../../../models/tile/tile";
import {useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {TileDatabase} from "../../../state/database/tileDatabase";
import {App} from "../../../appContext";

export function useTileById(id: Tile.Id | null | undefined): Tile | null {
    return useQuerySingle(App.tileDatabase, TileDatabase.QUERY_BY_ID, id);
}