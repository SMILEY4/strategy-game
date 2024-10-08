import {Query} from "../query/query";
import {PrimaryDatabaseStorage} from "../storage/primary/primaryDatabaseStorage";
import {DatabaseOperation} from "./databaseOperation";
import {TransactionObject} from "./transaction";

/**
 * A database storing entities of a given type with unique ids of a given type.
 */
export interface Database<STORAGE extends PrimaryDatabaseStorage<ENTITY, ID>, ENTITY, ID> extends TransactionObject {

    /**
     * @return a unique revision id that gets updated every time the content of the database is changed
     */
    getRevId(): string;

    /**
     * Perform the given action in a "transaction". All changes are collected and subscribers are notified after the action.
     * @param action the action to perform inside the "transaction"
     */
    transaction(action: () => void): void;

    /**
     * Subscribe to all changes
     * @param callback the event callback
     * @return the id of the subscriber
     */
    subscribe(callback: (entities: ENTITY[], operation: DatabaseOperation) => void): string;

    /**
     * Subscribe to changes to a specific entity
     * @param entityId the id of the entity
     * @param callback the event callback
     * @return ["the id of the subscriber", "the initial entity or null"]
     */
    subscribeOnEntity(entityId: ID, callback: (entity: ENTITY, operation: DatabaseOperation) => void): [string, ENTITY | null];

    /**
     * Subscribe to changes of a given query
     * @param query the query to perform and check for changes
     * @param args the dynamic query arguments
     * @param callback the event callback
     * @return ["the id of the subscriber", "the initial result of the query"]
     */
    subscribeOnQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, callback: (entities: ENTITY[]) => void): [string, ENTITY[]];

    /**
     * Subscribe to changes of single entity of a given query
     * @param query the query to perform and check for changes
     * @param args the dynamic query arguments
     * @param callback the event callback
     * @return ["the id of the subscriber", "the initial result of the query"]
     */
    subscribeOnQuerySingle<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, callback: (entity: ENTITY | null) => void): [string, ENTITY | null];

    /**
     * Remove the subscriber with the given id
     * @param subscriberId the id of the subscriber to remove
     */
    unsubscribe(subscriberId: string): void;

    /**
     * Insert the given entity
     * @param entity the entity to insert
     * @return the id of inserted entity
     */
    insert(entity: ENTITY): ID | null;

    /**
     * Insert the given entities
     * @param entities the entities to insert
     * @return the ids of the inserted entities
     */
    insertMany(entities: ENTITY[]): ID[];

    /**
     * Delete the entity with the given id
     * @param id the id of the entity to delete
     * @return the deleted entity or null
     */
    delete(id: ID): ENTITY | null;

    /**
     * Delete the entities with the given ids
     * @param ids the ids of the entities to delete
     * @return the deleted entities
     */
    deleteMany(ids: ID[]): ENTITY[];

    /**
     * Delete the entities returned by the given query
     * @param query the query
     * @param args the dynamic arguments for the query
     * @return the deleted entities
     */
    deleteByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY[];

    /**
     * Delete all entities
     * @return the deleted entities
     */
    deleteAll(): ENTITY[];

    /**
     * Update the entity with the given id. The entity-id may not be modified!
     * @param id the id of the entity to update
     * @param action the update to perform. Returns a (partial) entity with new values that are merged into the original.
     * @return the modified entity (or null)
     */
    update(id: ID, action: (entity: ENTITY) => Partial<ENTITY>): ENTITY | null;

    /**
     * Update the entities with the given ids. The entity-id may not be modified!
     * @param ids the ids of the entities to update
     * @param action the update to perform. Returns a (partial) entity with new values that are merged into the original.
     * @return the modified entities
     */
    updateMany(ids: ID[], action: (entity: ENTITY) => Partial<ENTITY>): ENTITY[];

    /**
     * Update the entities returned from the query. The entity-id may not be modified!
     * @param query the query
     * @param args the dynamic arguments for the query
     * @param action the update to perform. Returns a (partial) entity with new values that are merged into the original.
     * @return the modified entities
     */
    updateByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, action: (entity: ENTITY) => Partial<ENTITY>): ENTITY[];


    /**
     * Replace the entity with the given id. The entity-id may not be modified!
     * @param id the id of the entity to replace
     * @param action the update to perform. Returns a new entity that replaces the original.
     * @return the modified entity (or null)
     */
    replace(id: ID, action: (entity: ENTITY) => ENTITY): ENTITY | null;

    /**
     * Replace the entities with the given ids. The entity-id may not be modified!
     * @param ids the ids of the entities to replace
     * @param action the update to perform. Returns a new entity that replaces the original.
     * @return the modified entities
     */
    replaceMany(ids: ID[], action: (entity: ENTITY) => ENTITY): ENTITY[];

    /**
     * Replace the entities returned from the query. The entity-id may not be modified!
     * @param query the query
     * @param args the dynamic arguments for the query
     * @param action the update to perform. Returns a new entity that replaces the original.
     * @return the modified entities
     */
    replaceByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, action: (entity: ENTITY) => ENTITY): ENTITY[];

    /**
     * Count the number of stored entities
     * @return the number of entities
     */
    count(): number;

    /**
     * Retrieve a single entity with the given id
     * @param id the id of the entity
     * @return the entity with the given id or null
     */
    queryById(id: ID): ENTITY | null;

    /**
     * Retrieve a single entity with the given query
     * @param query the query
     * @param args the dynamic argument for the query
     * @return the query result or null if no entity matches
     */
    querySingle<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY | null;

    /**
     * Retrieve entities with the given query
     * @param query the query
     * @param args the dynamic argument for the query
     * @return the query result
     */
    queryMany<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY[];

}