import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {CountryEntity} from "../../models/country/countryEntity";

function provideId(e: CountryEntity): string {
    return e.id;
}

interface CountryStorageConfig extends DatabaseStorageConfig<CountryEntity, string> {
    primary: MapPrimaryStorage<CountryEntity, string>,
    supporting: {
        array: ArraySupportingStorage<CountryEntity>,
    }
}

class CountryStorage extends DatabaseStorage<CountryStorageConfig, CountryEntity, string> {
    constructor() {
        super({
            primary: new MapPrimaryStorage<CountryEntity, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<CountryEntity>(),
            },
        });
    }
}

export class CountryDatabase extends AbstractDatabase<CountryStorage, CountryEntity, string> {
    constructor() {
        super(new CountryStorage(), provideId);
    }
}

interface CountryQuery<ARGS> extends Query<CountryStorage, CountryEntity, string, ARGS> {
}


export namespace CountryDatabase {

    export const QUERY_BY_ID: CountryQuery<string | null> = {
        run(storage: CountryStorage, args: string): CountryEntity | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_ALL: CountryQuery<void> = {
        run(storage: CountryStorage, args: void): CountryEntity[] {
            return storage.config.supporting.array.getAll();
        },
    };

    export const QUERY_IS_USER_COUNTRY: CountryQuery<void> = {
        run(storage: CountryStorage, args: void): CountryEntity {
            const country = storage.config.supporting.array.getAll().find(it => it.isUserControlled);
            if (country) {
                return country;
            } else {
                throw new Error("Could not find country for current user.");
            }
        },
    };

}