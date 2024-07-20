import {MapPrimaryStorage} from "../../shared/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../shared/db/database/abstractDatabase";
import {Query} from "../../shared/db/query/query";
import {Tile, TileIdentifier} from "../../models/tile";
import {useQuerySingle} from "../../shared/db/adapters/databaseHooks";
import {AppCtx} from "../../appContext";
import {DatabaseStorage, DatabaseStorageConfig} from "../../shared/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../shared/db/storage/supporting/arraySupportingStorage";
import {MapUniqueSupportingStorage} from "../../shared/db/storage/supporting/mapUniqueSupportingStorage";

function provideId(e: Tile): string {
    return e.identifier.id;
}

interface TileStorageConfig extends DatabaseStorageConfig<Tile, string> {
    primary: MapPrimaryStorage<Tile, string>,
    supporting: {
        array: ArraySupportingStorage<Tile>,
        byPos: MapUniqueSupportingStorage<Tile, string>
    }
}

class TileStorage extends DatabaseStorage<TileStorageConfig, Tile, string> {

    public static toKey(q: number, r: number): string {
        return q + "/" + r;
    }

    constructor() {
        super({
            primary: new MapPrimaryStorage<Tile, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<Tile>(),
                byPos: new MapUniqueSupportingStorage<Tile, string>(e => TileStorage.toKey(e.identifier.q, e.identifier.r)),
            },
        });
    }
}

export class TileDatabase extends AbstractDatabase<TileStorage, Tile, string> {
    constructor() {
        super(new TileStorage(), provideId);
    }
}

interface TileQuery<ARGS> extends Query<TileStorage, Tile, string, ARGS> {
}


export namespace TileDatabase {

    export const QUERY_BY_ID: TileQuery<string | null> = {
        run(storage: TileStorage, args: string): Tile | null {
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

    export function useTileById(tileIdentifier: TileIdentifier | null): Tile | null {
        return useQuerySingle(AppCtx.TileDatabase(), QUERY_BY_ID, tileIdentifier === null ? null : tileIdentifier.id);
    }

}