import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {Country} from "../models/country";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {City} from "../models/city";
import {Tile} from "../models/tile";

function provideId(e: Tile): string {
    return e.identifier.id;
}

class TileStorage extends MapDatabaseStorage<Tile, string> {
    constructor() {
        super(provideId);
    }
}

export class TileDatabase extends AbstractDatabase<TileStorage, Tile, string> {
    constructor() {
        super(new TileStorage(), provideId);
    }
}

interface TileQuery<ARGS> extends Query<TileStorage, Tile, string, ARGS> {
}