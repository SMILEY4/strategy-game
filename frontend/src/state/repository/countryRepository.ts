import {useQueryMultiple, useQuerySingleOrThrow} from "../../common/db/adapters/databaseHooks";
import {useDI} from "../../appContext";
import {Country} from "../../models/base/country";
import {CountryDatabase} from "../database/countryDatabase";

export class CountryRepository {

    private readonly db: CountryDatabase;

    constructor(db: CountryDatabase) {
        this.db = db;
    }

    public getPlayerCountry(): Country {
        return this.db.querySingleOrThrow(CountryDatabase.QUERY_IS_USER_COUNTRY, null);
    }

}

export namespace CountryRepository {

    export function useAll(): Country[] {
        const db = useDI<CountryDatabase>(CountryDatabase.name);
        return useQueryMultiple(db, CountryDatabase.QUERY_ALL, null);
    }

    export function usePlayerCountry(): Country {
        const db = useDI<CountryDatabase>(CountryDatabase.name);
        return useQuerySingleOrThrow(db, CountryDatabase.QUERY_IS_USER_COUNTRY, null);
    }

}