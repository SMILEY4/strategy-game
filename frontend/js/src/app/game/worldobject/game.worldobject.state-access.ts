import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {WorldObjectDatabase} from "../../database/worldObjectDatabase";
import {App} from "../../../appContext";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {useQueryMultiple, useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {Tile} from "../../../models/tile/tile";
import {Realm} from "../../../models/realm/realm";
import {Db} from "../../database";

// const worldObjectsCache: DbCache<WorldObject[]> = new DbCache({
//     dataProvider: () => WorldObjectStateAccess.getAllUncached(),
//     dependencies: [App.worldObjectDatabase],
// });

export const WorldObjectStateAccess = {

    useWorldObjectById(id: WorldObject.Id | null | undefined): WorldObject | null {
        return useQuerySingle(Db.worldObject, WorldObjectDatabase.QUERY_BY_ID, id);
    },

    useWorldObjectByPosition(position: Tile.Position | null | undefined): WorldObject[] {
        const pos = position ? [position.q, position.r] : Tile.POSITION_NOWHERE;
        return useQueryMultiple(Db.worldObject, WorldObjectDatabase.QUERY_BY_POSITION, pos);
    },

    useWorldObjectByRealm(id: Realm.Id | null): WorldObject[] {
        return useQueryMultiple(Db.worldObject, WorldObjectDatabase.QUERY_BY_REALM_ID, id);
    },

    getWorldObjectsRevId(): string {
        return Db.worldObject.getRevId();
    },

    getAllUncached(): WorldObject[] {
        return Db.worldObject.queryMany(WorldObjectDatabase.QUERY_ALL, null);
    },

    getAll(): WorldObject[] {
        // return worldObjectsCache.get(); todo
        return WorldObjectStateAccess.getAllUncached();
    },

    getSummariesAt(q: number, r: number): WorldObjectSummary[] {
        return Db.worldObject.queryMany(WorldObjectDatabase.QUERY_BY_POSITION, [q, r]);
    },

};