import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {Route} from "../../models/route/route";

function provideId(e: Route): Route.Id {
    return e.id;
}

interface RouteStorageConfig extends DatabaseStorageConfig<Route, Route.Id> {
    primary: MapPrimaryStorage<Route, Route.Id>,
    supporting: {
        array: ArraySupportingStorage<Route>,
    }
}

class RouteStorage extends DatabaseStorage<RouteStorageConfig, Route, Route.Id> {

    public static toKey(q: number, r: number): string {
        return q + "/" + r;
    }

    constructor() {
        super({
            primary: new MapPrimaryStorage<Route, Route.Id>(provideId),
            supporting: {
                array: new ArraySupportingStorage<Route>(),
            },
        });
    }
}

export class RouteDatabase extends AbstractDatabase<RouteStorage, Route, Route.Id> {
    constructor() {
        super(new RouteStorage(), provideId);
    }
}

interface RouteQuery<ARGS> extends Query<RouteStorage, Route, Route.Id, ARGS> {
}


export namespace RouteDatabase {

    export const QUERY_ALL: RouteQuery<void> = {
        run(storage: RouteStorage, args: void): Route[] {
            return storage.config.supporting.array.getAll();
        },
    };

    export const QUERY_BY_ID: RouteQuery<Route.Id | null> = {
        run(storage: RouteStorage, args: Route.Id): Route | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

}