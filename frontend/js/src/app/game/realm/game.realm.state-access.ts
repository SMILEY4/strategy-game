import {Realm} from "../../../models/realm/realm";
import {useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {App} from "../../../appContext";
import {RealmDatabase} from "../../../state/database/realmDatabase";

export const RealmStateAccess = {

    useRealmById(id: Realm.Id | null): Realm | null {
        return useQuerySingle(App.realmDatabase, RealmDatabase.QUERY_BY_ID, id);
    }

}