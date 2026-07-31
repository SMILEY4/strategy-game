import {MapPrimaryDatabaseStorageUnit} from "@modules/gamedb/storage/implementations/database-storage-unit.primary.map.ts";
import type {Query} from "@modules/gamedb/database/query.ts";
import type {Database} from "@modules/gamedb/database/database.ts";
import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import type {Tile} from "@app/features/game/models/tile.ts";
import {MapSupportingStorage} from "@modules/gamedb/storage/implementations/database-storage-unit.supporting.map.ts";
import {MapUniqueSupportingStorage} from "@modules/gamedb/storage/implementations/database-storage-unit.supporting.map-unique.ts";


/** Database type alias for tile storage with primary, by-position, and by-chunk indexes. */
export type TileDatabase = Database<TileStorageMapping, Tile, string>

type TileStorageMapping = {
    primary: MapPrimaryDatabaseStorageUnit<Tile, string>,
    byPosition: MapUniqueSupportingStorage<Tile, string>,
    byChunk: MapSupportingStorage<Tile, string>
}

export function tileDatabase(): TileDatabase {
    return DatabaseBuilder.create<Tile, string, TileStorageMapping>()
        .withIdProvider(e => e.id)
        .withStorage(idProvider => ({
            primary: new MapPrimaryDatabaseStorageUnit<Tile, string>(idProvider),
            byPosition: new MapUniqueSupportingStorage<Tile, string>(e => `${e.position.q};${e.position.r}`),
            byChunk: new MapSupportingStorage<Tile, string>(e => `${e.chunk.q};${e.chunk.r}`)
        }))
        .build()
}

/** Query type alias for tile database queries. */
export type TileQuery<ARGS> = Query<TileStorageMapping, Tile, string, ARGS>


export const TileQueries = {

    ALL: {
        run: (storage: TileStorageMapping) => {
            return storage.primary.getAll()
        }
    },

    BY_POSITION: {
        run: (storage: TileStorageMapping, args: { q: number, r: number }) => {
            return storage.byPosition.getByKey(`${args.q};${args.r}`);
        }
    }

} satisfies {
    ALL: TileQuery<never>,
    BY_POSITION: TileQuery<{ q: number, r: number }>
}