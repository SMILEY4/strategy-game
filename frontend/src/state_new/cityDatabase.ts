import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {Country} from "../models/country";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {City} from "../models/city";

function provideId(e: City): string {
    return e.identifier.id;
}

class CityStorage extends MapDatabaseStorage<City, string> {
    constructor() {
        super(provideId);
    }
}

export class CityDatabase extends AbstractDatabase<CityStorage, City, string> {
    constructor() {
        super(new CityStorage(), provideId);
    }
}

interface CityQuery<ARGS> extends Query<CityStorage, City, string, ARGS> {
}