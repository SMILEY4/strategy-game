import {DatabaseStorage} from "../storage/databaseStorage";
import {DbSubscriber, EntitySubscriber, QuerySubscriber} from "../subscriber/databaseSubscriber";
import {DatabaseOperation} from "./databaseOperation";
import {Query} from "../query/query";
import {UID} from "../../uid";
import {Database} from "./database";

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

    public getStorage(): STORAGE {
        return this.storage;
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
            if (this.transactionContext !== null) {
                this.checkSubscribersQuery();
                this.checkSubscribersEntity(this.transactionContext.deletedEntities, this.transactionContext.deletedIds, DatabaseOperation.DELETE);
                this.checkSubscribersEntity(this.transactionContext.insertedEntities, this.transactionContext.insertedIds, DatabaseOperation.INSERT);
                this.checkSubscribersDb(this.transactionContext.deletedEntities, DatabaseOperation.DELETE);
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
        if (!this.arrEquals(subscriber.lastIds, resultIds)) {
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
            if (a[i] !== b[i]) {
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

    public delete(id: ID): ENTITY | null {
        const entity = this.storage.delete(id);
        if (entity !== null) {
            this.notify([entity], [id], DatabaseOperation.DELETE);
        }
        return entity;
    }

    public deleteMany(ids: ID[]): ENTITY[] {
        const entities = this.storage.deleteMany(ids);
        this.notify(entities, ids, DatabaseOperation.DELETE);
        return entities;
    }

    public deleteByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY[] {
        const result = this.queryMany(query, args);
        const deletedEntities: ENTITY[] = [];
        const deletedIds: ID[] = [];
        for (const entity of result) {
            const id = this.idProvider(entity);
            const deletedEntity = this.storage.delete(id);
            if (deletedEntity !== null) {
                deletedEntities.push(deletedEntity);
                deletedIds.push(id);
            }
        }
        this.notify(deletedEntities, deletedIds, DatabaseOperation.DELETE);
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
