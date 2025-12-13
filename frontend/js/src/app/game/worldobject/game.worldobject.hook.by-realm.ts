import {WorldObject} from "../../../models/worldobject/worldObject";
import {useQueryMultiple} from "../../../common/db/adapters/databaseHooks";
import {WorldObjectDatabase} from "../../../state/database/worldObjectDatabase";
import {App} from "../../../appContext";
import {Realm} from "../../../models/realm/realm";

export function useWorldObjectByRealm(id: Realm.Id | null): WorldObject[] {
    return useQueryMultiple(App.worldObjectDatabase, WorldObjectDatabase.QUERY_BY_REALM_ID, id);
}