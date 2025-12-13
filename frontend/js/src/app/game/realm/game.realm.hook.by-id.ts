import {Realm} from "../../../models/realm/realm";
import {useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {RealmDatabase} from "../../../state/database/realmDatabase";
import {App} from "../../../appContext";

export function useRealmById(id: Realm.Id | null): Realm | null {
    return useQuerySingle(App.realmDatabase, RealmDatabase.QUERY_BY_ID, id);
}