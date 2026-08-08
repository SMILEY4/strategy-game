import {MapPrimaryDatabaseStorageUnit} from "@modules/gamedb/storage/implementations/database-storage-unit.primary.map.ts";
import type {Query} from "@modules/gamedb/database/query.ts";
import type {Database} from "@modules/gamedb/database/database.ts";
import {DatabaseBuilder} from "@modules/gamedb/database-builder.ts";
import {type Entity, EntityUtils} from "@app/features/game/models/entity.ts";
import {MapSupportingStorage} from "@modules/gamedb/storage/implementations/database-storage-unit.supporting.map.ts";


export type EntityDatabase = Database<EntityStorageMapping, Entity, string>

type EntityStorageMapping = {
    primary: MapPrimaryDatabaseStorageUnit<Entity, string>,
    byPosition: MapSupportingStorage<Entity, string>
}

export function entityDatabase(): EntityDatabase {
    return DatabaseBuilder.create<Entity, string, EntityStorageMapping>()
        .withIdProvider(e => e.id)
        .withStorage(idProvider => ({
            primary: new MapPrimaryDatabaseStorageUnit<Entity, string>(idProvider),
            byPosition: new MapSupportingStorage<Entity, string>(e => {
                const position = EntityUtils.getPosition(e);
                return position
                    ? `${position.q};${position.r}`
                    : "?;?";
            }),
        }))
        .build();
}

export type EntityQuery<ARGS> = Query<EntityStorageMapping, Entity, string, ARGS>


export const EntityQueries = {

    ALL: {
        run: (storage: EntityStorageMapping) => {
            return storage.primary.getAll();
        },
    },

    BY_POSITION: {
        run: (storage: EntityStorageMapping, args: { q: number, r: number }) => {
            return storage.byPosition.getByKey(`${args.q};${args.r}`);
        },
    },

} satisfies {
    ALL: EntityQuery<never>,
    BY_POSITION: EntityQuery<{ q: number, r: number }>,
};