import {MapPrimaryStorage} from "../../common/db/storage/primary/mapPrimaryStorage";
import {AbstractDatabase} from "../../common/db/database/abstractDatabase";
import {Query} from "../../common/db/query/query";
import {DatabaseStorage, DatabaseStorageConfig} from "../../common/db/storage/databaseStorage";
import {ArraySupportingStorage} from "../../common/db/storage/supporting/arraySupportingStorage";
import {MapUniqueSupportingStorage} from "../../common/db/storage/supporting/mapUniqueSupportingStorage";
import {TileEntity} from "../../models/tile/tileEntity";

function provideId(e: TileEntity): string {
    return e.id;
}

interface TileStorageConfig extends DatabaseStorageConfig<TileEntity, string> {
    primary: MapPrimaryStorage<TileEntity, string>,
    supporting: {
        array: ArraySupportingStorage<TileEntity>,
        byPos: MapUniqueSupportingStorage<TileEntity, string>
    }
}

class TileStorage extends DatabaseStorage<TileStorageConfig, TileEntity, string> {

    public static toKey(q: number, r: number): string {
        return q + "/" + r;
    }

    constructor() {
        super({
            primary: new MapPrimaryStorage<TileEntity, string>(provideId),
            supporting: {
                array: new ArraySupportingStorage<TileEntity>(),
                byPos: new MapUniqueSupportingStorage<TileEntity, string>(e => TileStorage.toKey(e.position.q, e.position.r)),
            },
        });
    }
}

export class TileDatabase extends AbstractDatabase<TileStorage, TileEntity, string> {
    constructor() {
        super(new TileStorage(), provideId);
    }
}

interface TileQuery<ARGS> extends Query<TileStorage, TileEntity, string, ARGS> {
}


export namespace TileDatabase {

    export const QUERY_BY_ID: TileQuery<string | null> = {
        run(storage: TileStorage, args: string): TileEntity | null {
            if (args === null) {
                return null;
            }
            return storage.config.primary.get(args);
        },
    };

    export const QUERY_BY_POSITION: TileQuery<[number, number]> = {
        run(storage: TileStorage, args: [number, number]): TileEntity | null{
            return storage.config.supporting.byPos.getByKey(TileStorage.toKey(args[0], args[1]));
        },
    };

    export const QUERY_ALL: TileQuery<void> = {
        run(storage: TileStorage, args: void): TileEntity[] {
            return storage.config.supporting.array.getAll();
        },
    };

}