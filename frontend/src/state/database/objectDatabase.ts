import {MapPrimaryStorage} from "../../shared/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../shared/db/database/abstractDatabase";
import {Query} from "../../shared/db/query/query";
import {Tile, TileIdentifier} from "../../models/tile";
import {useQuerySingle} from "../../shared/db/adapters/databaseHooks";
import {AppCtx} from "../../appContext";
import {DatabaseStorage, DatabaseStorageConfig} from "../../shared/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../shared/db/storage/supporting/arraySupportingStorage";
import {MapUniqueSupportingStorage} from "../../shared/db/storage/supporting/mapUniqueSupportingStorage";
import {WorldObject} from "../../models/worldObject";

function provideId(e: WorldObject): string {
    return e.id;
}

interface WorldObjectStorageConfig extends DatabaseStorageConfig<WorldObject, string> {
    primary: MapPrimaryStorage<WorldObject, string>,
    supporting: {
        array: ArraySupportingStorage<WorldObject>,
        byPos: MapUniqueSupportingStorage<WorldObject, string>
    }
}

class WorldObjectStorage extends DatabaseStorage<WorldObjectStorageConfig, WorldObject, string> {

    public static toKey(q: number, r: number): string {
        return q + "/" + r;
    }

    constructor() {
        super({
            primary: new MapPrimaryStorage<WorldObject, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<WorldObject>(),
                byPos: new MapUniqueSupportingStorage<WorldObject, string>(e => WorldObjectStorage.toKey(e.tile.q, e.tile.r)),
            },
        });
    }
}

export class WorldObjectDatabase extends AbstractDatabase<WorldObjectStorage, WorldObject, string> {
    constructor() {
        super(new WorldObjectStorage(), provideId);
    }
}

interface WorldObjectQuery<ARGS> extends Query<WorldObjectStorage, WorldObject, string, ARGS> {
}


export namespace WorldObjectDatabase {

    export const QUERY_BY_ID: WorldObjectQuery<string | null> = {
        run(storage: WorldObjectStorage, args: string): WorldObject | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_BY_POSITION: WorldObjectQuery<[number, number]> = {
        run(storage: WorldObjectStorage, args: [number, number]): WorldObject | null{
            return storage.config.supporting.byPos.getByKey(WorldObjectStorage.toKey(args[0], args[1]));
        },
    };

    export const QUERY_ALL: WorldObjectQuery<void> = {
        run(storage: WorldObjectStorage, args: void): WorldObject[] {
            return storage.config.supporting.array.getAll();
        },
    };

}