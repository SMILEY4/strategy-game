import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {MapSupportingStorage} from "../../common/db/storage/supporting/mapSupportingStorage";
import {WorldObject} from "../../models/worldobject/worldObject";
import {Realm} from "../../models/realm/realm";

function provideId(e: WorldObject): WorldObject.Id {
    return e.id;
}

interface WorldObjectStorageConfig extends DatabaseStorageConfig<WorldObject, WorldObject.Id> {
    primary: MapPrimaryStorage<WorldObject, WorldObject.Id>,
    supporting: {
        array: ArraySupportingStorage<WorldObject>,
        byPos: MapSupportingStorage<WorldObject, string>,
        byRealm: MapSupportingStorage<WorldObject, Realm.Id>
    }
}

class WorldObjectStorage extends DatabaseStorage<WorldObjectStorageConfig, WorldObject, WorldObject.Id> {

    public static toKey(q: number, r: number): string {
        return q + "/" + r;
    }

    constructor() {
        super({
            primary: new MapPrimaryStorage<WorldObject, WorldObject.Id>(provideId),
            supporting: {
                array: new ArraySupportingStorage<WorldObject>(),
                byPos: new MapSupportingStorage<WorldObject, string>(e => WorldObjectStorage.toKey(e.tile.position.q, e.tile.position.r)),
                byRealm: new MapSupportingStorage<WorldObject, Realm.Id>(e => e.realm.id)
            },
        });
    }
}

export class WorldObjectDatabase extends AbstractDatabase<WorldObjectStorage, WorldObject, WorldObject.Id> {
    constructor() {
        super(new WorldObjectStorage(), provideId);
    }
}

interface WorldObjectQuery<ARGS> extends Query<WorldObjectStorage, WorldObject, WorldObject.Id, ARGS> {
}


export namespace WorldObjectDatabase {

    export const QUERY_ALL: WorldObjectQuery<void> = {
        run(storage: WorldObjectStorage, args: void): WorldObject[] {
            return storage.config.supporting.array.getAll();
        },
    };

    export const QUERY_BY_ID: WorldObjectQuery<WorldObject.Id | null> = {
        run(storage: WorldObjectStorage, args: WorldObject.Id): WorldObject | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_BY_POSITION: WorldObjectQuery<[number, number]> = {
        run(storage: WorldObjectStorage, args: [number, number]): WorldObject[] {
            return storage.config.supporting.byPos.getByKey(WorldObjectStorage.toKey(args[0], args[1]));
        },
    };

    export const QUERY_BY_REALM_ID: WorldObjectQuery<Realm.Id | null> = {
        run(storage: WorldObjectStorage, args: Realm.Id): WorldObject[] {
			if (args === null) {
				return [];
			}
			return storage.config.supporting.byRealm.getByKey(args)
        },
    };

}