import {MapPrimaryDatabaseStorageUnit} from "@modules/gamedb/storage/implementations/database-storage-unit.primary.map.ts";
import type {Query} from "@modules/gamedb/database/query.ts";
import type {Database} from "@modules/gamedb/database/database.ts";
import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {Route} from "@app/features/game/models/route.ts";


export type RouteDatabase = Database<RouteStorageMapping, Route, number>

type RouteStorageMapping = {
    primary: MapPrimaryDatabaseStorageUnit<Route, number>,
}

export function routeDatabase(): RouteDatabase {
    return DatabaseBuilder.create<Route, number, RouteStorageMapping>()
        .withIdProvider(e => e.id)
        .withStorage(idProvider => ({
            primary: new MapPrimaryDatabaseStorageUnit<Route, number>(idProvider),
        }))
        .build();
}

export type RouteQuery<ARGS> = Query<RouteStorageMapping, Route, number, ARGS>


export const RouteQueries = {

    ALL: {
        run: (storage: RouteStorageMapping) => {
            return storage.primary.getAll();
        },
    },

} satisfies {
    ALL: RouteQuery<never>,
};