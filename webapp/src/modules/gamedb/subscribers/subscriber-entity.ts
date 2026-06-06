import type {DatabaseOperation} from "@modules/gamedb/database/database-operation.ts";

/**
 * A subscriber listening to changes of an entity with a given id
 */
export interface EntitySubscriber<ENTITY, ID> {
    entityId: ID,
    callback: (entity: ENTITY, operation: DatabaseOperation) => void
}