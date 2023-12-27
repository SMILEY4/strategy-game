import {DatabaseOperation} from "../database/databaseOperation";
import {DatabaseStorage} from "../storage/databaseStorage";
import {Query} from "../query/query";

/**
 * A subscriber listening to all changes in a database
 */
export interface DbSubscriber<ENTITY> {
    callback: (entities: ENTITY[], operation: DatabaseOperation) => void;
}

/**
 * A subscriber listening to changes of a given query
 */
export interface QuerySubscriber<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID> {
    query: Query<STORAGE, ENTITY, ID, any>,
    args: any,
    callback: (entities: ENTITY[]) => void,
    lastIds: ID[]
}

/**
 * A subscriber listening to changes of an entity with a given id
 */
export interface EntitySubscriber<ENTITY, ID> {
    entityId: ID,
    callback: (entity: ENTITY, operation: DatabaseOperation) => void
}
