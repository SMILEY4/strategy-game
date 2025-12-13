import {WorldObject} from "../../../models/worldobject/worldObject";
import {useQueryMultiple, useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {WorldObjectDatabase} from "../../../state/database/worldObjectDatabase";
import {App} from "../../../appContext";
import {Tile} from "../../../models/tile/tile";

export function useWorldObjectByPosition(position: Tile.Position | null | undefined): WorldObject[] {
    const pos = position ? [position.q, position.r] : Tile.POSITION_NOWHERE
    return useQueryMultiple(App.worldObjectDatabase, WorldObjectDatabase.QUERY_BY_POSITION, pos);
}