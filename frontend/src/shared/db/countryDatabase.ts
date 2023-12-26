import {Country} from "../../models/country";
import {AbstractDatabase, DatabaseStorage, Query} from "./database";


class CountryDbStorage implements DatabaseStorage<Country, string> {

    insert(entity: Country): string {
        return undefined as any;
    }

    insertMany(entities: Country[]): string[] {
        return [];
    }

    delete(id: string): Country {
        return undefined as any;
    }

    deleteAll(): Country[] {
        return [];
    }

    deleteMany(ids: string[]): Country[] {
        return [];
    }

    getByCountryId(countryId: string): Country[] {
        throw new Error("Method not implemented.");
    }

    getAll(): Country[] {
        throw new Error("Method not implemented.");
    }

}

export class CountryDatabase extends AbstractDatabase<CountryDbStorage, Country, string> {
    constructor() {
        super(new CountryDbStorage(), country => country.identifier.id);
    }
}

export const COUNTRY_QUERY_BY_COUNTRY_ID: Query<CountryDbStorage, Country, string, string> = {
    run: (storage, args) => {
        return storage.getByCountryId(args);
    },
};


export const COUNTRY_QUERY_BY_SETTLER_COUNT: Query<CountryDbStorage, Country, string, number> = {
    run: (storage, args) => {
        return storage.getAll().filter(c => (c.settlers || 0) === args);
    },
};