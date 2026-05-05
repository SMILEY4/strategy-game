import {MapPrimaryDatabaseStorageUnit} from "@gamedb/storage/implementations/database-storage-unit.primary.map.ts";
import {ArraySupportingStorage} from "@gamedb/storage/implementations/database-storage-unit.supporting.flat-array.ts";
import {MapUniqueSupportingStorage} from "@gamedb/storage/implementations/database-storage-unit.supporting.map-unique.ts";
import type {Query} from "@gamedb/database/query.ts";
import {DatabaseBuilder} from "@gamedb/database-builder.ts";

interface Tile {
    id: string,
    q: number,
    r: number,
}

type TileDbStorageMapping = {
    primary: MapPrimaryDatabaseStorageUnit<Tile, string>,
    array: ArraySupportingStorage<Tile>,
    pos: MapUniqueSupportingStorage<Tile, string>
}

type TileQuery<ARGS> = Query<TileDbStorageMapping, Tile, string, ARGS>

const QUERY_BY_ID: TileQuery<string | null> = {
    run(storage: TileDbStorageMapping, args: string): Tile | null {
        if (args === null) {
            return null;
        }
        return storage.primary.get(args);
    },
};


function test1() {

    const idProvider: (e: Tile) => string = (e: Tile) => e.id

    const db = DatabaseBuilder.create<Tile, string, TileDbStorageMapping>()
        .withStorage({
            primary: new MapPrimaryDatabaseStorageUnit<Tile, string>(idProvider),
            array: new ArraySupportingStorage(),
            pos: new MapUniqueSupportingStorage((e: Tile) => e.q + "/" + e.r)
        })
        .withIdProvider(idProvider)
        .build()

    const result: Tile | null = db.querySingle(QUERY_BY_ID, "someid")

    console.log(result)
}



function test2() {

    const db = DatabaseBuilder.createSingleton<Tile>()
        .withInitialValue({
            id: "someid",
            q: 4,
            r: 2
        })
        .build()

    const result: Tile = db.get()

    console.log(result)
}