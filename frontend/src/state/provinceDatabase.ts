import {MapPrimaryStorage} from "../shared/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {Province} from "../models/province";
import {useQuerySingleOrThrow} from "../shared/db/adapters/databaseHooks";
import {AppCtx} from "../appContext";
import {DatabaseStorage, DatabaseStorageConfig} from "../shared/db/storage/databaseStorage";
import {MapUniqueMultikeySupportingStorage} from "../shared/db/storage/supporting/mapUniqueMultikeySupportingStorage";

function provideId(e: Province): string {
    return e.identifier.id;
}


interface ProvinceStorageConfig extends DatabaseStorageConfig<Province, string> {
    primary: MapPrimaryStorage<Province, string>,
    supporting: {
        byCityId: MapUniqueMultikeySupportingStorage<Province, string>
    }
}

class ProvinceStorage extends DatabaseStorage<ProvinceStorageConfig, Province, string> {
    constructor() {
        super({
            primary: new MapPrimaryStorage<Province, string>(provideId),
            supporting: {
                byCityId: new MapUniqueMultikeySupportingStorage<Province, string>(e => e.cities.map(c => c.identifier.id))
            }
        });
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
        run(storage: ProvinceStorage, args: string): Province | null {
            return storage.get(args);
        },
    };

    export const QUERY_BY_CITY_ID: ProvinceQuery<string> = {
        run(storage: ProvinceStorage, args: string): Province | null {
            return storage.config.supporting.byCityId.getByKey(args)
        },
    };

    export function useProvinceById(provinceId: string): Province {
        return useQuerySingleOrThrow(AppCtx.ProvinceDatabase(), QUERY_BY_ID, provinceId)
    }

}