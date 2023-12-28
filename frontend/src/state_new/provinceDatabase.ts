import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {Province} from "../models/province";
import {useQuerySingleOrThrow} from "../shared/db/adapters/databaseHooks";
import {AppCtx} from "../appContext";

function provideId(e: Province): string {
    return e.identifier.id;
}

class ProvinceStorage extends MapDatabaseStorage<Province, string> {
    constructor() {
        super(provideId);
    }
}

export class ProvinceDatabase extends AbstractDatabase<ProvinceStorage, Province, string> {
    constructor() {
        super(new ProvinceStorage(), provideId);
    }
}

interface ProvinceQuery<ARGS> extends Query<ProvinceStorage, Province, string, ARGS> {
}

export namespace ProvinceDatabase {

    export const QUERY_BY_ID: ProvinceQuery<string> = {
        run(storage: ProvinceStorage, args: string): Province[] {
            const result = storage.getById(args);
            if (result === null) {
                return [];
            } else {
                return [result];
            }
        },
    };

    export const QUERY_BY_CITY_ID: ProvinceQuery<string> = {
        run(storage: ProvinceStorage, args: string): Province[] {
            const result = storage.getAll().find(p => p.cities.map(c => c.identifier.id).indexOf(args) !== -1);
            if (result) {
                return [result];
            } else {
                return [];
            }
        },
    };

    export function useProvinceById(provinceId: string): Province {
        return useQuerySingleOrThrow(AppCtx.ProvinceDatabase(), QUERY_BY_ID, provinceId)
    }

}