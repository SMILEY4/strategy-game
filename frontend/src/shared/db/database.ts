import {UID} from "../uid";

export interface Query<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID, ARGS> {
    run(storage: STORAGE, args: ARGS): ENTITY[];
}

export interface DatabaseStorage<ENTITY, ID> {
    /**
     * Insert the given entity
     * @param entity the entity to insert
     * @return the id of the inserted entity
     */
    insert(entity: ENTITY): ID;

    /**
     * Insert the given entities
     * @param entities the entities to insert
     * @return the ids of the inserted entities
     */
    insertMany(entities: ENTITY[]): ID[];

    /**
     * Delete the entity with the given id
     * @param id the id of the entity to delete
     * @return the deleted entity
     */
    delete(id: ID): ENTITY;

    /**
     * Delete the entities with the given ids
     * @param ids the ids of the entities to delete
     * @return the deleted entities
     */
    deleteMany(ids: ID[]): ENTITY[];

    /**
     * Delete all entities
     * @return the deleted entities
     */
    deleteAll(): ENTITY[];

}

export interface Database<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID> {

    /**
     * @return the name of the database
     */
    getName(): string;

    /**
     * Start a new "transaction", during which no subscribers will be notified. All changes are collected and passed on to subscribers at the end.
     */
    startTransaction(): void;

    /**
     * End a "transaction" and notify subscribers of all collected changes
     */
    endTransaction(): void;

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
     * @return the id of the subscriber
     */
    subscribeOnEntity(entityId: ID, callback: (entity: ENTITY, operation: DatabaseOperation) => void): string;

    /**
     * Subscribe to changes of a given query
     * @param query the query to perform and check for changes
     * @param args the dynamic query arguments
     * @param callback the event callback
     * @return the id of the subscriber
     */
    subscribeOnQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, callback: (entities: ENTITY[]) => void): string;

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
    insert(entity: ENTITY): ID;

    /**
     * Insert the given entities
     * @param entities the entities to insert
     * @return the ids of the inserted entities
     */
    insertMany(entities: ENTITY[]): ID[];

    /**
     * Delete the entity with the given id
     * @param id the id of the entity to delete
     * @return the deleted entity
     */
    delete(id: ID): ENTITY;

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

    // todo: update

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

export enum DatabaseOperation {
    INSERT, DELETE
}

export interface DbSubscriber<ENTITY> {
    callback: (entities: ENTITY[], operation: DatabaseOperation) => void;
}

export interface QuerySubscriber<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID> {
    query: Query<STORAGE, ENTITY, ID, any>,
    args: any,
    callback: (entities: ENTITY[]) => void,
    lastIds: ID[]
}

export interface EntitySubscriber<ENTITY, ID> {
    entityId: ID,
    callback: (entity: ENTITY, operation: DatabaseOperation) => void
}


export class AbstractDatabase<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID> implements Database<STORAGE, ENTITY, ID> {

    private readonly name: string;

    private readonly storage: STORAGE;

    private readonly idProvider: (entity: ENTITY) => ID;

    private readonly subscribers = {
        db: new Map<string, DbSubscriber<ENTITY>>,
        entity: new Map<string, EntitySubscriber<ENTITY, ID>>,
        query: new Map<string, QuerySubscriber<STORAGE, ENTITY, ID>>,
    };

    constructor(name: string, storage: STORAGE, idProvider: (entity: ENTITY) => ID) {
        this.name = name;
        this.storage = storage;
        this.idProvider = idProvider;
    }

    public getName(): string {
        return this.name;
    }

    //==== TRANSACTION =====================================================

    private transactionContext: null | {
        insertedEntities: ENTITY[],
        insertedIds: ID[],
        deletedEntities: ENTITY[],
        deletedIds: ID[],
    } = null;

    public startTransaction() {
        this.transactionContext = {
            insertedEntities: [],
            insertedIds: [],
            deletedEntities: [],
            deletedIds: [],
        };
    }

    public endTransaction() {
        try {
            this.checkSubscribersQuery();
            if (this.transactionContext) {
                this.checkSubscribersEntity(this.transactionContext.deletedEntities, this.transactionContext.deletedIds, DatabaseOperation.DELETE);
                this.checkSubscribersDb(this.transactionContext.deletedEntities, DatabaseOperation.DELETE);
                this.checkSubscribersEntity(this.transactionContext.insertedEntities, this.transactionContext.insertedIds, DatabaseOperation.INSERT);
                this.checkSubscribersDb(this.transactionContext.insertedEntities, DatabaseOperation.INSERT);
            }
        } finally {
            this.transactionContext = null;
        }
    }

    public transaction(action: () => void) {
        try {
            this.startTransaction();
            action();
        } finally {
            this.endTransaction();
        }
    }

    //==== SUBSCRIPTIONS ===================================================

    public subscribe(callback: (entities: ENTITY[], operation: DatabaseOperation) => void): string {
        const subscriberId = this.genSubscriberId();
        this.subscribers.db.set(subscriberId, {
            callback: callback,
        });
        return subscriberId;
    }

    public subscribeOnEntity(entityId: ID, callback: (entity: ENTITY, operation: DatabaseOperation) => void): string {
        const subscriberId = this.genSubscriberId();
        this.subscribers.entity.set(subscriberId, {
            entityId: entityId,
            callback: callback,
        });
        return subscriberId;
    }

    public subscribeOnQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, callback: (entities: ENTITY[]) => void): string {
        const subscriberId = this.genSubscriberId();
        this.subscribers.query.set(subscriberId, {
            query: query,
            args: args,
            callback: callback,
            lastIds: [],
        });
        return subscriberId;
    }

    public unsubscribe(subscriberId: string): void {
        this.subscribers.db.delete(subscriberId);
        this.subscribers.entity.delete(subscriberId);
        this.subscribers.query.delete(subscriberId);
    }

    private genSubscriberId(): string {
        return UID.generate();
    }

    private notify(entities: ENTITY[], ids: ID[], operation: DatabaseOperation) {
        if (this.transactionContext) {
            switch (operation) {
                case DatabaseOperation.INSERT: {
                    this.transactionContext.insertedIds.push(...ids);
                    this.transactionContext.insertedEntities.push(...entities);
                    break;
                }
                case DatabaseOperation.DELETE: {
                    this.transactionContext.deletedIds.push(...ids);
                    this.transactionContext.deletedEntities.push(...entities);
                    break;
                }
            }
        } else {
            this.checkSubscribersQuery();
            this.checkSubscribersEntity(entities, ids, operation);
            this.checkSubscribersDb(entities, operation);
        }
    }


    private checkSubscribersQuery() {
        for (let [_, subscriber] of this.subscribers.query) {
            this.checkSubscriberQuery(subscriber);
        }
    }

    private checkSubscriberQuery(subscriber: QuerySubscriber<STORAGE, ENTITY, ID>) {
        const result: ENTITY[] = this.queryMany(subscriber.query, subscriber.args);
        const resultIds = result.map(this.idProvider).sort();
        if (this.arrEquals(subscriber.lastIds, resultIds)) {
            subscriber.lastIds = resultIds;
            subscriber.callback(result);
        }
    }

    private checkSubscribersEntity(entities: ENTITY[], ids: ID[], operation: DatabaseOperation) {
        for (let [_, subscriber] of this.subscribers.entity) {
            this.checkSubscriberEntity(subscriber, entities, ids, operation);
        }
    }

    private checkSubscriberEntity(subscriber: EntitySubscriber<ENTITY, ID>, entities: ENTITY[], ids: ID[], operation: DatabaseOperation) {
        const index = ids.indexOf(subscriber.entityId);
        if (index !== -1) {
            subscriber.callback(entities[index], operation);
        }
    }

    private checkSubscribersDb(entities: ENTITY[], operation: DatabaseOperation) {
        for (let [_, subscriber] of this.subscribers.db) {
            subscriber.callback(entities, operation);
        }
    }

    private arrEquals(a: any[], b: any[]): boolean {
        // both arrays must be sorted before
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0, n = a.length; i < n; i++) {
            if (a[i] !== b[n]) {
                return false;
            }
        }
        return true;
    }


    //==== CRUD ============================================================

    public insert(entity: ENTITY): ID {
        const id = this.storage.insert(entity);
        this.notify([entity], [id], DatabaseOperation.INSERT);
        return id;
    }

    public insertMany(entities: ENTITY[]): ID[] {
        const ids = this.storage.insertMany(entities);
        this.notify(entities, ids, DatabaseOperation.INSERT);
        return ids;
    }

    public delete(id: ID): ENTITY {
        const entity = this.storage.delete(id);
        this.notify([entity], [id], DatabaseOperation.DELETE);
        return entity;
    }

    public deleteMany(ids: ID[]): ENTITY[] {
        const entities = this.storage.deleteMany(ids);
        this.notify(entities, ids, DatabaseOperation.DELETE);
        return entities;
    }

    public deleteByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY[] {
        const result = this.queryMany(query, args);
        const ids: ID[] = [];
        for (const entity of result) {
            const id = this.idProvider(entity);
            this.delete(id);
            ids.push(id);
        }
        this.notify(result, ids, DatabaseOperation.DELETE);
        return result;
    }

    public deleteAll(): ENTITY[] {
        const entities = this.storage.deleteAll();
        this.notify(entities, entities.map(this.idProvider), DatabaseOperation.DELETE);
        return entities;
    }

    public queryMany<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY[] {
        return query.run(this.storage, args);
    }

    public querySingle<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY | null {
        const result = this.queryMany(query, args);
        if (result.length > 0) {
            return result[0];
        } else {
            return null;
        }
    }

}
