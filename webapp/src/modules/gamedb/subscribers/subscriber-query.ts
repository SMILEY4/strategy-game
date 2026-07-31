import type {Query} from "@modules/gamedb/database/query.ts";
import type {DatabaseStorageUnitMapping} from "@modules/gamedb/storage/database-storage.ts";

/**
 * A subscriber listening to changes of a given query
 */
export interface QuerySubscriber<STORAGE extends DatabaseStorageUnitMapping<ENTITY, ID>, ENTITY, ID, ARGS> {
    query: Query<STORAGE, ENTITY, ID, ARGS>,
    args: ARGS,
    callback: (entities: ENTITY[]) => void,
    lastIds: ID[]
}