import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {RealmEntity} from "../../models/realm/realmEntity";

function provideId(e: RealmEntity): string {
    return e.id;
}

interface RealmStorageConfig extends DatabaseStorageConfig<RealmEntity, string> {
    primary: MapPrimaryStorage<RealmEntity, string>,
    supporting: {
        array: ArraySupportingStorage<RealmEntity>,
    }
}

class RealmStorage extends DatabaseStorage<RealmStorageConfig, RealmEntity, string> {
    constructor() {
        super({
            primary: new MapPrimaryStorage<RealmEntity, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<RealmEntity>(),
            },
        });
    }
}

export class RealmDatabase extends AbstractDatabase<RealmStorage, RealmEntity, string> {
    constructor() {
        super(new RealmStorage(), provideId);
    }
}

interface RealmQuery<ARGS> extends Query<RealmStorage, RealmEntity, string, ARGS> {
}


export namespace RealmDatabase {

    export const QUERY_BY_ID: RealmQuery<string | null> = {
        run(storage: RealmStorage, args: string): RealmEntity | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_ALL: RealmQuery<void> = {
        run(storage: RealmStorage, args: void): RealmEntity[] {
            return storage.config.supporting.array.getAll();
        },
    };

    export const QUERY_IS_USER_REALM: RealmQuery<void> = {
        run(storage: RealmStorage, args: void): RealmEntity {
            const realm = storage.config.supporting.array.getAll().find(it => it.ownedByUser);
            if (realm) {
                return realm;
            } else {
                throw new Error("Could not find realm for current user.");
            }
        },
    };

}