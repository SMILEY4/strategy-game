import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {Route} from "../models/route";
import {City} from "../models/city";

function provideId(e: Route): string {
    return e.routeId;
}

class RouteStorage extends MapDatabaseStorage<Route, string> {
    constructor() {
        super(provideId);
    }
}

export class RouteDatabase extends AbstractDatabase<RouteStorage, Route, string> {
    constructor() {
        super(new RouteStorage(), provideId);
    }
}

interface RouteQuery<ARGS> extends Query<RouteStorage, Route, string, ARGS> {
}

export namespace RouteDatabase {

    export const QUERY_ALL: RouteQuery<void> = {
        run(storage: RouteStorage, args: void): Route[] {
            return storage.getAll();
        },
    };


    export const QUERY_BY_CITY_ID: RouteQuery<string> = {
        run(storage: RouteStorage, args: string): Route[] {
            return storage.getAll().filter(r => r.cityA.id === args || r.cityB.id === args);
        },
    };

}