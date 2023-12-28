import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {City} from "../models/city";
import {useQuerySingleOrThrow} from "../shared/db/adapters/databaseHooks";
import {AppCtx} from "../appContext";

function provideId(e: City): string {
    return e.identifier.id;
}

class CityStorage extends MapDatabaseStorage<City, string> {
    constructor() {
        super(provideId);
    }
}

export class CityDatabase extends AbstractDatabase<CityStorage, City, string> {
    constructor() {
        super(new CityStorage(), provideId);
    }
}

interface CityQuery<ARGS> extends Query<CityStorage, City, string, ARGS> {
}


export namespace CityDatabase {

    export const QUERY_BY_ID: CityQuery<string> = {
        run(storage: CityStorage, args: string): City[] {
            const result = storage.getById(args);
            if (result === null) {
                return [];
            } else {
                return [result];
            }
        },
    };

    export const QUERY_ALL: CityQuery<void> = {
        run(storage: CityStorage, args: void): City[] {
            return storage.getAll();
        },
    };

    export function useCityById(cityId: string): City {
        return useQuerySingleOrThrow(AppCtx.CityDatabase(), QUERY_BY_ID, cityId);
    }

}