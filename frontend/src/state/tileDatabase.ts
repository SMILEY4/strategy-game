import {MapDatabaseStorage} from "../shared/db/storage/mapDatabaseStorage";
import {AbstractDatabase} from "../shared/db/database/abstractDatabase";
import {Query} from "../shared/db/query/query";
import {Tile, TileIdentifier} from "../models/tile";
import {useQuerySingle} from "../shared/db/adapters/databaseHooks";
import {AppCtx} from "../appContext";

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


export namespace TileDatabase {

    export const QUERY_BY_ID: TileQuery<TileIdentifier> = {
        run(storage: TileStorage, args: TileIdentifier): Tile[] {
            return [] // todo
        },
    };

    export const QUERY_BY_POSITION: TileQuery<[number, number]> = {
        run(storage: TileStorage, args: [number, number]): Tile[] {
            return [] // todo
        },
    };

    export const QUERY_ALL: TileQuery<void> = {
        run(storage: TileStorage, args: void): Tile[] {
            return [] // todo
        },
    };

    export function useTileById(tileIdentifier: TileIdentifier | null): Tile | null {
        return useQuerySingle(AppCtx.TileDatabase(), QUERY_BY_ID, tileIdentifier)
    }

}