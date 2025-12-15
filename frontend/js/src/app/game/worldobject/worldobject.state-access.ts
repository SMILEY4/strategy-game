import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {WorldObjectDatabase} from "../../database/worldObjectDatabase";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {useQueryMultiple, useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {Tile} from "../../../models/tile/tile";
import {Realm} from "../../../models/realm/realm";
import {Db} from "../../database";
import {DbCache} from "../../../common/db/dbCache";


let worldObjectCache: DbCache<WorldObject[]> | null = null;

function getWorldObjectCache(): DbCache<WorldObject[]> {
    if (worldObjectCache) return worldObjectCache;
    worldObjectCache = new DbCache({
        dataProvider: () => WorldObjectStateAccess.getAllUncached(),
        dependencies: [Db.worldObject],
    });
    return worldObjectCache;
}

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
        return getWorldObjectCache().get();
    },

    getSummariesAt(q: number, r: number): WorldObjectSummary[] {
        return Db.worldObject.queryMany(WorldObjectDatabase.QUERY_BY_POSITION, [q, r]);
    },

};