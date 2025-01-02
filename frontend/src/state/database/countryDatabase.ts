import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {Country} from "../../models/base/country";

function provideId(e: Country): string {
    return e.identifier.id;
}

interface CountryStorageConfig extends DatabaseStorageConfig<Country, string> {
    primary: MapPrimaryStorage<Country, string>,
    supporting: {
        array: ArraySupportingStorage<Country>,
    }
}

class CountryStorage extends DatabaseStorage<CountryStorageConfig, Country, string> {
    constructor() {
        super({
            primary: new MapPrimaryStorage<Country, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<Country>(),
            },
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

    export const QUERY_BY_ID: CountryQuery<string | null> = {
        run(storage: CountryStorage, args: string): Country | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_ALL: CountryQuery<void> = {
        run(storage: CountryStorage, args: void): Country[] {
            return storage.config.supporting.array.getAll();
        },
    };

    export const QUERY_IS_USER_COUNTRY: CountryQuery<void> = {
        run(storage: CountryStorage, args: void): Country {
            const country = storage.config.supporting.array.getAll().find(it => it.identifier.isUserCountry);
            if (country) {
                return country;
            } else {
                throw new Error("Could not find country for current user.");
            }
        },
    };

}