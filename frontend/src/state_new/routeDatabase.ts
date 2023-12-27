import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {Country} from "../models/country";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {City} from "../models/city";
import {Route} from "../models/route";

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