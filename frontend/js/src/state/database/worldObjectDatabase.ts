import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {MapUniqueSupportingStorage} from "../../common/db/storage/supporting/mapUniqueSupportingStorage";
import {MapSupportingStorage} from "../../common/db/storage/supporting/mapSupportingStorage";
import {WorldObjectEntity} from "../../models/worldobject/worldObjectEntity";

function provideId(e: WorldObjectEntity): string {
    return e.id;
}

interface WorldObjectStorageConfig extends DatabaseStorageConfig<WorldObjectEntity, string> {
    primary: MapPrimaryStorage<WorldObjectEntity, string>,
    supporting: {
        array: ArraySupportingStorage<WorldObjectEntity>,
        byPos: MapUniqueSupportingStorage<WorldObjectEntity, string>,
        byCountry: MapSupportingStorage<WorldObjectEntity, string>
    }
}

class WorldObjectStorage extends DatabaseStorage<WorldObjectStorageConfig, WorldObjectEntity, string> {

    public static toKey(q: number, r: number): string {
        return q + "/" + r;
    }

    constructor() {
        super({
            primary: new MapPrimaryStorage<WorldObjectEntity, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<WorldObjectEntity>(),
                byPos: new MapUniqueSupportingStorage<WorldObjectEntity, string>(e => WorldObjectStorage.toKey(e.tile.position.q, e.tile.position.r)),
                byCountry: new MapSupportingStorage<WorldObjectEntity, string>(e => e.country.id)
            },
        });
    }
}

export class WorldObjectDatabase extends AbstractDatabase<WorldObjectStorage, WorldObjectEntity, string> {
    constructor() {
        super(new WorldObjectStorage(), provideId);
    }
}

interface WorldObjectQuery<ARGS> extends Query<WorldObjectStorage, WorldObjectEntity, string, ARGS> {
}


export namespace WorldObjectDatabase {

    export const QUERY_ALL: WorldObjectQuery<void> = {
        run(storage: WorldObjectStorage, args: void): WorldObjectEntity[] {
            return storage.config.supporting.array.getAll();
        },
    };

    export const QUERY_BY_ID: WorldObjectQuery<string | null> = {
        run(storage: WorldObjectStorage, args: string): WorldObjectEntity | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_BY_POSITION: WorldObjectQuery<[number, number]> = {
        run(storage: WorldObjectStorage, args: [number, number]): WorldObjectEntity | null {
            return storage.config.supporting.byPos.getByKey(WorldObjectStorage.toKey(args[0], args[1]));
        },
    };

    export const QUERY_BY_COUNTRY_ID: WorldObjectQuery<string> = {
        run(storage: WorldObjectStorage, args: string): WorldObjectEntity[] {
            return storage.config.supporting.byCountry.getByKey(args)
        },
    };

}