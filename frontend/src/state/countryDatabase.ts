import {MapPrimaryStorage} from "../shared/db/storage/primary/mapPrimaryStorage";
import {Country} from "../models/country";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {useQuerySingleOrThrow} from "../shared/db/adapters/databaseHooks";
import {AppCtx} from "../appContext";
import {DatabaseStorage, DatabaseStorageConfig} from "../shared/db/storage/databaseStorage";
import {Command} from "../models/command";
import {ArraySupportingStorage} from "../shared/db/storage/supporting/arraySupportingStorage";
import {MapSupportingStorage} from "../shared/db/storage/supporting/mapSupportingStorage";
import {CommandType} from "../models/commandType";
import {MapUniqueSupportingStorage} from "../shared/db/storage/supporting/mapUniqueSupportingStorage";

function provideId(e: Country): string {
    return e.identifier.id;
}


interface CountryStorageConfig extends DatabaseStorageConfig<Country, string> {
    primary: MapPrimaryStorage<Country, string>,
    supporting: {
        byUserId: MapUniqueSupportingStorage<Country, string>
    }
}

class CountryStorage extends DatabaseStorage<CountryStorageConfig, Country, string> {
    constructor() {
        super({
            primary: new MapPrimaryStorage<Country, string>(provideId),
            supporting: {
                byUserId: new MapUniqueSupportingStorage<Country, string>(e => e.player.userId)
            }
        });
    }
}

export class CountryDatabase extends AbstractDatabase<CountryStorage, Country, string> {
    constructor() {
        super(new CountryStorage(), provideId);
    }
}

interface CountryQuery<ARGS> extends Query<CountryStorage, Country, string, ARGS> {
}

export namespace CountryDatabase {

    export const QUERY_BY_ID: CountryQuery<string> = {
        run(storage: CountryStorage, args: string): Country | null {
            return storage.get(args);
        },
    };

    export const QUERY_BY_USER_ID: CountryQuery<string> = {
        run(storage: CountryStorage, args: string): Country | null {
            return storage.config.supporting.byUserId.getByKey(args)
        },
    };

    export function useCountryById(countryId: string): Country {
        return useQuerySingleOrThrow(AppCtx.CountryDatabase(), QUERY_BY_ID, countryId);
    }

    export function useCountryByUserId(userId: string): Country {
        return useQuerySingleOrThrow(AppCtx.CountryDatabase(), QUERY_BY_USER_ID, userId);
    }

}