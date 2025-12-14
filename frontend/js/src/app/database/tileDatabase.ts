import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {MapUniqueSupportingStorage} from "../../common/db/storage/supporting/mapUniqueSupportingStorage";
import {Tile} from "../../models/tile/tile";

function provideId(e: Tile): Tile.Id {
    return e.id;
}

interface TileStorageConfig extends DatabaseStorageConfig<Tile, Tile.Id> {
    primary: MapPrimaryStorage<Tile, Tile.Id>,
    supporting: {
        array: ArraySupportingStorage<Tile>,
        byPos: MapUniqueSupportingStorage<Tile, string>
    }
}

class TileStorage extends DatabaseStorage<TileStorageConfig, Tile, Tile.Id> {

    public static toKey(q: number, r: number): string {
        return q + "/" + r;
    }

    constructor() {
        super({
            primary: new MapPrimaryStorage<Tile, Tile.Id>(provideId),
            supporting: {
                array: new ArraySupportingStorage<Tile>(),
                byPos: new MapUniqueSupportingStorage<Tile, string>(e => TileStorage.toKey(e.position.q, e.position.r)),
            },
        });
    }
}

export class TileDatabase extends AbstractDatabase<TileStorage, Tile, Tile.Id> {
    constructor() {
        super(new TileStorage(), provideId);
    }
}

interface TileQuery<ARGS> extends Query<TileStorage, Tile, Tile.Id, ARGS> {
}


export namespace TileDatabase {

    export const QUERY_BY_ID: TileQuery<Tile.Id | null> = {
        run(storage: TileStorage, args: Tile.Id): Tile | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_BY_POSITION: TileQuery<[number, number]> = {
        run(storage: TileStorage, args: [number, number]): Tile | null{
            return storage.config.supporting.byPos.getByKey(TileStorage.toKey(args[0], args[1]));
        },
    };

    export const QUERY_ALL: TileQuery<void> = {
        run(storage: TileStorage, args: void): Tile[] {
            return storage.config.supporting.array.getAll();
        },
    };

}