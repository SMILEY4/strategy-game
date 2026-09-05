import {MapPrimaryDatabaseStorageUnit} from "@modules/gamedb/storage/implementations/database-storage-unit.primary.map.ts";
import type {Query} from "@modules/gamedb/database/query.ts";
import type {Database} from "@modules/gamedb/database/database.ts";
import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {Realm} from "@app/features/game/models/realm.ts";

export type RealmDatabase = Database<RealmStorageMapping, Realm, number>

type RealmStorageMapping = {
    primary: MapPrimaryDatabaseStorageUnit<Realm, number>
}

export function realmDatabase(): RealmDatabase {
    return DatabaseBuilder.create<Realm, number, RealmStorageMapping>()
        .withIdProvider(realm => realm.id)
        .withStorage(idProvider => ({
            primary: new MapPrimaryDatabaseStorageUnit<Realm, number>(idProvider),
        }))
        .build();
}

export type RealmQuery<ARGS> = Query<RealmStorageMapping, Realm, number, ARGS>

export const RealmQueries = {
    ALL: {
        run: (storage: RealmStorageMapping) => storage.primary.getAll(),
    },
    OWNED: {
        run: (storage: RealmStorageMapping) => storage.primary.getAll().find(realm => realm.owned) ?? null,
    },
} satisfies {
    ALL: RealmQuery<never>,
    OWNED: RealmQuery<never>,
};
