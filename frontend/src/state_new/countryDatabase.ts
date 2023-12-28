import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {Country} from "../models/country";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {useQuerySingleOrThrow} from "../shared/db/adapters/databaseHooks";
import {AppCtx} from "../appContext";

function provideId(e: Country): string {
    return e.identifier.id;
}

class CountryStorage extends MapDatabaseStorage<Country, string> {
    constructor() {
        super(provideId);
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
        run(storage: CountryStorage, args: string): Country[] {
            const result = storage.getById(args);
            if (result === null) {
                return [];
            } else {
                return [result];
            }
        },
    };

    export const QUERY_BY_USER_ID: CountryQuery<string> = {
        run(storage: CountryStorage, args: string): Country[] {
            const country = storage.getAll().find(c => c.player.userId === args);
            if (country) {
                return [country];
            } else {
                return [];
            }
        },
    };

    export function useCountryById(countryId: string): Country {
        return useQuerySingleOrThrow(AppCtx.CountryDatabase(), QUERY_BY_ID, countryId);
    }

    export function useCountryByUserId(userId: string): Country {
        return useQuerySingleOrThrow(AppCtx.CountryDatabase(), QUERY_BY_USER_ID, userId);
    }

}