import {useQueryMultiple} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";
import {WorldObjectDatabase} from "../../../state/database/worldObjectDatabase";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {WorldObjectOutline} from "../../../models/worldobject/worldObjectOutline";

export function useOutlinerTileImprovements(): WorldObjectOutline[] {
    return useQueryMultiple(App.worldObjectDatabase, WorldObjectDatabase.QUERY_ALL, null) // todo: dedicated query
        .filter(it => it.type.group === WorldObject.TypeGroup.TileImprovement)
        .map(it => ({
            id: it.id,
            type: it.type,
            tile: it.tile,
            realm: it.realm,
        }));
}