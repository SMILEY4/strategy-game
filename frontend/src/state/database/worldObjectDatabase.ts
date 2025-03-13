import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {MapUniqueSupportingStorage} from "../../common/db/storage/supporting/mapUniqueSupportingStorage";
import {WorldObject} from "../../models/base/worldObject";
import {MapSupportingStorage} from "../../common/db/storage/supporting/mapSupportingStorage";

function provideId(e: WorldObject): string {
    return e.identifier.id;
}

interface WorldObjectStorageConfig extends DatabaseStorageConfig<WorldObject, string> {
    primary: MapPrimaryStorage<WorldObject, string>,
    supporting: {
        array: ArraySupportingStorage<WorldObject>,
        byPos: MapUniqueSupportingStorage<WorldObject, string>,
        byCountry: MapSupportingStorage<WorldObject, string>
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
                byCountry: new MapSupportingStorage<WorldObject, string>(e => e.country.id)
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

    export const QUERY_ALL: WorldObjectQuery<void> = {
        run(storage: WorldObjectStorage, args: void): WorldObject[] {
            return storage.config.supporting.array.getAll();
        },
    };

    export const QUERY_BY_ID: WorldObjectQuery<string | null> = {
        run(storage: WorldObjectStorage, args: string): WorldObject | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_BY_POSITION: WorldObjectQuery<[number, number]> = {
        run(storage: WorldObjectStorage, args: [number, number]): WorldObject | null {
            return storage.config.supporting.byPos.getByKey(WorldObjectStorage.toKey(args[0], args[1]));
        },
    };

    export const QUERY_BY_COUNTRY_ID: WorldObjectQuery<string> = {
        run(storage: WorldObjectStorage, args: string): WorldObject[] {
            return storage.config.supporting.byCountry.getByKey(args)
        },
    };

}