import {MapPrimaryStorage} from "../../shared/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../shared/db/database/abstractDatabase";
import {Query} from "../../shared/db/query/query";
import {City} from "../../models/city";
import {useQuerySingleOrThrow} from "../../shared/db/adapters/databaseHooks";
import {AppCtx} from "../../appContext";
import {DatabaseStorage, DatabaseStorageConfig} from "../../shared/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../shared/db/storage/supporting/arraySupportingStorage";
import {MapUniqueSupportingStorage} from "../../shared/db/storage/supporting/mapUniqueSupportingStorage";

function provideId(e: City): string {
    return e.identifier.id;
}


interface CityStorageConfig extends DatabaseStorageConfig<City, string> {
    primary: MapPrimaryStorage<City, string>,
    supporting: {
        array: ArraySupportingStorage<City>,
        byTileId: MapUniqueSupportingStorage<City, string>
    }
}


class CityStorage extends DatabaseStorage<CityStorageConfig, City, string> {
    constructor() {
        super({
            primary: new MapPrimaryStorage<City, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<City>(),
                byTileId: new MapUniqueSupportingStorage<City, string>(e => e.tile.id)
            }
        });
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
        run(storage: CityStorage, args: string): City | null {
            return storage.get(args)
        },
    };

    export const QUERY_BY_TILE_ID: CityQuery<string> = {
        run(storage: CityStorage, args: string): City | null {
            return storage.config.supporting.byTileId.getByKey(args)
        },
    };

    export const QUERY_ALL: CityQuery<void> = {
        run(storage: CityStorage, args: void): City[] {
            return storage.config.supporting.array.getAll()
        },
    };

    export function useCityById(cityId: string): City {
        return useQuerySingleOrThrow(AppCtx.CityDatabase(), QUERY_BY_ID, cityId);
    }

}