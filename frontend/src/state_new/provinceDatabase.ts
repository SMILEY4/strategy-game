import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {Country} from "../models/country";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {Province} from "../models/province";

function provideId(e: Province): string {
    return e.identifier.id;
}

class ProvinceStorage extends MapDatabaseStorage<Province, string> {
    constructor() {
        super(provideId);
    }
}

export class ProvinceDatabase extends AbstractDatabase<ProvinceStorage, Province, string> {
    constructor() {
        super(new ProvinceStorage(), provideId);
    }
}

interface ProvinceQuery<ARGS> extends Query<ProvinceStorage, Province, string, ARGS> {
}