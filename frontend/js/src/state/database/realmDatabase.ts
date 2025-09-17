import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {Realm} from "../../models/realm/realm";

function provideId(e: Realm): Realm.Id {
    return e.id;
}

interface RealmStorageConfig extends DatabaseStorageConfig<Realm, Realm.Id> {
    primary: MapPrimaryStorage<Realm, Realm.Id>,
    supporting: {
        array: ArraySupportingStorage<Realm>,
    }
}

class RealmStorage extends DatabaseStorage<RealmStorageConfig, Realm, Realm.Id> {
    constructor() {
        super({
            primary: new MapPrimaryStorage<Realm, Realm.Id>(provideId),
            supporting: {
                array: new ArraySupportingStorage<Realm>(),
            },
        });
    }
}

export class RealmDatabase extends AbstractDatabase<RealmStorage, Realm, Realm.Id> {
    constructor() {
        super(new RealmStorage(), provideId);
    }
}

interface RealmQuery<ARGS> extends Query<RealmStorage, Realm, Realm.Id, ARGS> {
}


export namespace RealmDatabase {

    export const QUERY_BY_ID: RealmQuery<Realm.Id | null> = {
        run(storage: RealmStorage, args: Realm.Id): Realm | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_ALL: RealmQuery<void> = {
        run(storage: RealmStorage, args: void): Realm[] {
            return storage.config.supporting.array.getAll();
        },
    };

    export const QUERY_IS_USER_REALM: RealmQuery<void> = {
        run(storage: RealmStorage, args: void): Realm {
            const realm = storage.config.supporting.array.getAll().find(it => it.ownedByUser);
            if (realm) {
                return realm;
            } else {
                throw new Error("Could not find realm for current user.");
            }
        },
    };

}