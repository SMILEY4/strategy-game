import {MapPrimaryStorage} from "../shared/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {Route} from "../models/route";
import {DatabaseStorage, DatabaseStorageConfig} from "../shared/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../shared/db/storage/supporting/arraySupportingStorage";
import {MapMultikeySupportingStorage} from "../shared/db/storage/supporting/mapMultikeySupportingStorage";

function provideId(e: Route): string {
    return e.routeId;
}

function provideCityKeys(route: Route): string[] {
    const keys: string[] = []
    if(route.cityA.visible) {
        keys.push(route.cityA.value.id)
    }
    if(route.cityB.visible) {
        keys.push(route.cityB.value.id)
    }
    return keys
}

interface RouteStorageConfig extends DatabaseStorageConfig<Route, string> {
    primary: MapPrimaryStorage<Route, string>,
    supporting: {
        array: ArraySupportingStorage<Route>,
        byCityId: MapMultikeySupportingStorage<Route, string>
    }
}

class RouteStorage extends DatabaseStorage<RouteStorageConfig, Route, string> {
    constructor() {
        super({
            primary: new MapPrimaryStorage<Route, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<Route>(),
                byCityId: new MapMultikeySupportingStorage<Route, string>(provideCityKeys)
            }
        });
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
            return storage.config.supporting.array.getAll()
        },
    };

    export const QUERY_BY_CITY_ID: RouteQuery<string> = {
        run(storage: RouteStorage, args: string): Route[] {
            return storage.config.supporting.byCityId.getByKey(args)
        },
    };

}