import {WorldObjectOutline} from "../../../models/worldobject/worldObjectOutline";
import {useQueryMultiple} from "../../../common/db/adapters/databaseHooks";
import {WorldObjectDatabase} from "../../database/worldObjectDatabase";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {RealmOutline} from "../../../models/realm/realmOutline";
import {RealmDatabase} from "../../database/realmDatabase";
import {Db} from "../../database";

export const OutlinerStateAccess = {

    useOutlinerRealms(): RealmOutline[] {
        return useQueryMultiple(Db.realm, RealmDatabase.QUERY_ALL, null)
            .map(it => RealmOutline.from(it));
    },

    useOutlinerTileImprovements(): WorldObjectOutline[] {
        return useQueryMultiple(Db.worldObject, WorldObjectDatabase.QUERY_ALL, null) // todo: dedicated query
            .filter(it => it.type.group === WorldObject.TypeGroup.TileImprovement)
            .map(it => ({
                id: it.id,
                type: it.type,
                tile: it.tile,
                realm: it.realm,
            }));
    },

    useOutlinerUnits(): WorldObjectOutline[] {
        return useQueryMultiple(Db.worldObject, WorldObjectDatabase.QUERY_ALL, null) // todo: dedicated query
            .filter(it => it.type.group === WorldObject.TypeGroup.Unit)
            .map(it => ({
                id: it.id,
                type: it.type,
                tile: it.tile,
                realm: it.realm,
            }));
    }

}