import {RealmOutline} from "../../../models/realm/realmOutline";
import {useQueryMultiple} from "../../../common/db/adapters/databaseHooks";
import {RealmDatabase} from "../../../state/database/realmDatabase";
import {App} from "../../../appContext";

export function useOutlinerRealms(): RealmOutline[] {
    return useQueryMultiple(App.realmDatabase, RealmDatabase.QUERY_ALL, null)
        .map(it => RealmOutline.from(it));
}