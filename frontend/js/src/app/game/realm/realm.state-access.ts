import {Realm} from "../../../models/realm/realm";
import {useQuerySingle} from "../../../common/db/adapters/databaseHooks";
import {RealmDatabase} from "../../database/realmDatabase";
import {Db} from "../../database";

export const RealmStateAccess = {

    useRealmById(id: Realm.Id | null): Realm | null {
        return useQuerySingle(Db.realm, RealmDatabase.QUERY_BY_ID, id);
    }

}