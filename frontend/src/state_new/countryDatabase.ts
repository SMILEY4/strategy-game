import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {Country} from "../models/country";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";

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