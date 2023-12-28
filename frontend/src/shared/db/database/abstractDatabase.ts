import {PrimaryDatabaseStorage} from "../storage/primary/primaryDatabaseStorage";
import {DbSubscriber, EntitySubscriber, QuerySubscriber} from "../subscriber/databaseSubscriber";
import {DatabaseOperation} from "./databaseOperation";
import {Query} from "../query/query";
import {UID} from "../../uid";
import {Database} from "./database";
import {IdProvider} from "../idProvider";

/**
 * Base implementation of a database
 */
export class AbstractDatabase<STORAGE extends PrimaryDatabaseStorage<ENTITY, ID>, ENTITY, ID> implements Database<STORAGE, ENTITY, ID> {

    private readonly storage: STORAGE;

    private readonly idProvider: IdProvider<ENTITY, ID>;

    private readonly subscribers = {
        db: new Map<string, DbSubscriber<ENTITY>>,
        entity: new Map<string, EntitySubscriber<ENTITY, ID>>,
        query: new Map<string, QuerySubscriber<STORAGE, ENTITY, ID>>,
    };

    private revId: string = UID.generate();

    private transactionContext: null | {
        changed: boolean,
        insertedEntities: ENTITY[],
        insertedIds: ID[],
        deletedEntities: ENTITY[],
        deletedIds: ID[],
        modifiedEntities: ENTITY[],
        modifiedIds: ID[],
    } = null;

    /**
     * @param storage the raw storage for the entities
     * @param idProvider a function providing the (unique) id of a given entity
     */
    constructor(storage: STORAGE, idProvider: IdProvider<ENTITY, ID>) {
        this.storage = storage;
        this.idProvider = idProvider;
    }


    public getStorage(): STORAGE {
        return this.storage;
    }

    //==== REVISION ID =====================================================

    public getRevId(): string {
        return this.revId;
    }

    private updateRevId() {
        this.revId = UID.generate();
    }

    //==== TRANSACTION =====================================================

    public startTransaction() {
        this.transactionContext = {
            changed: false,
            insertedEntities: [],
            insertedIds: [],
            deletedEntities: [],
            deletedIds: [],
            modifiedEntities: [],
            modifiedIds: [],
        };
    }

    public endTransaction() {
        try {
            if (this.transactionContext !== null && this.transactionContext.changed) {
                this.updateRevId();
                this.checkSubscribersQuery();
                this.checkSubscribersEntity(this.transactionContext.deletedEntities, this.transactionContext.deletedIds, DatabaseOperation.DELETE);
                this.checkSubscribersEntity(this.transactionContext.modifiedEntities, this.transactionContext.modifiedIds, DatabaseOperation.MODIFY);
                this.checkSubscribersEntity(this.transactionContext.insertedEntities, this.transactionContext.insertedIds, DatabaseOperation.INSERT);
                this.checkSubscribersDb(this.transactionContext.deletedEntities, DatabaseOperation.DELETE);
                this.checkSubscribersDb(this.transactionContext.modifiedEntities, DatabaseOperation.MODIFY);
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

    public subscribeOnQuerySingle<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, callback: (entity: ENTITY | null) => void): string {
        const subscriberId = this.genSubscriberId();
        this.subscribers.query.set(subscriberId, {
            query: query,
            args: args,
            callback: entities => entities.length > 0 ? callback(entities[0]) : callback(null),
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
        if (this.transactionContext && ids.length > 0) {
            this.transactionContext.changed = true;
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
                case DatabaseOperation.MODIFY: {
                    this.transactionContext.modifiedIds.push(...ids);
                    this.transactionContext.modifiedEntities.push(...entities);
                    break;
                }
                default: {
                    throw new Error("Unhandled database-operation: " + operation);
                }
            }
        } else {
            this.checkSubscribersQuery();
            this.checkSubscribersEntity(entities, ids, operation);
            this.checkSubscribersDb(entities, operation);
            if (ids.length > 0) {
                this.updateRevId();
            }
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


    //==== INSERT ==========================================================

    public insert(entity: ENTITY): ID | null {
        const result = this.storage.insert(entity);
        if (result) {
            this.notify([result.entity], [result.id], DatabaseOperation.INSERT);
            return result.id;
        } else {
            return null;
        }
    }

    public insertMany(entities: ENTITY[]): ID[] {
        const result = this.storage.insertMany(entities);
        this.notify(result.entities, result.ids, DatabaseOperation.INSERT);
        return result.ids;
    }

    //==== DELETE ==========================================================

    public delete(id: ID): ENTITY | null {
        const result = this.storage.delete(id);
        if (result) {
            this.notify([result.entity], [result.id], DatabaseOperation.DELETE);
            return result.entity;
        } else {
            return null;
        }
    }

    public deleteMany(ids: ID[]): ENTITY[] {
        const result = this.storage.deleteMany(ids);
        this.notify(result.entities, result.ids, DatabaseOperation.DELETE);
        return result.entities;
    }

    public deleteByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY[] {
        const queryIds = IdProvider.toIds(this.idProvider, this.queryMany(query, args));
        const result = this.storage.deleteMany(queryIds);
        this.notify(result.entities, result.ids, DatabaseOperation.DELETE);
        return result.entities;
    }

    public deleteAll(): ENTITY[] {
        const result = this.storage.deleteAll();
        this.notify(result.entities, result.ids, DatabaseOperation.DELETE);
        return result.entities;
    }


    //==== UPDATE ==========================================================

    public update(id: ID, action: (entity: ENTITY) => Partial<ENTITY>): ENTITY | null {
        const entity = this.storage.get(id);
        if (entity !== null) {
            const modified = {...entity, ...action(entity)};
            this.storage.replace(id, modified);
            this.notify([entity], [id], DatabaseOperation.MODIFY);
            return modified;
        } else {
            return null;
        }
    }

    public updateMany(ids: ID[], action: (entity: ENTITY) => Partial<ENTITY>): ENTITY[] {
        const modifiedEntities: ENTITY[] = [];
        const modifiedIds: ID[] = [];
        for (let id of ids) {
            const entity = this.storage.get(id);
            if (entity !== null) {
                const modified = {...entity, ...action(entity)};
                this.storage.replace(id, modified);
                modifiedEntities.push(modified);
                modifiedIds.push(id);
            }
        }
        this.notify(modifiedEntities, modifiedIds, DatabaseOperation.MODIFY);
        return modifiedEntities;
    }

    public updateByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, action: (entity: ENTITY) => Partial<ENTITY>): ENTITY[] {
        const queryResult = query.run(this.storage, args);

        if (queryResult === null) {
            return [];

        } else if (Array.isArray(queryResult)) {
            const modifiedEntities: ENTITY[] = [];
            const modifiedIds: ID[] = [];
            const entities = queryResult as ENTITY[];
            for (let entity of entities) {
                const modified = {...entity, ...action(entity)};
                const id = this.idProvider(entity);
                this.storage.replace(id, modified);
                modifiedEntities.push(modified);
                modifiedIds.push(id);
            }
            this.notify(modifiedEntities, modifiedIds, DatabaseOperation.MODIFY);
            return modifiedEntities;

        } else {
            const entity = queryResult as ENTITY;
            const modified = {...entity, ...action(entity)};
            const id = this.idProvider(entity);
            this.storage.replace(id, modified);
            this.notify([modified], [id], DatabaseOperation.MODIFY);
            return [modified];
        }
    }


    //==== REPLACE =========================================================

    public replace(id: ID, action: (entity: ENTITY) => ENTITY): ENTITY | null {
        const entity = this.storage.get(id);
        if (entity !== null) {
            const modified = action(entity);
            this.storage.replace(id, modified);
            this.notify([entity], [id], DatabaseOperation.MODIFY);
            return modified;
        } else {
            return null;
        }
    }

    public replaceMany(ids: ID[], action: (entity: ENTITY) => ENTITY): ENTITY[] {
        const modifiedEntities: ENTITY[] = [];
        const modifiedIds: ID[] = [];
        for (let id of ids) {
            const entity = this.storage.get(id);
            if (entity !== null) {
                const modified = action(entity);
                this.storage.replace(id, modified);
                modifiedEntities.push(modified);
                modifiedIds.push(id);
            }
        }
        this.notify(modifiedEntities, modifiedIds, DatabaseOperation.MODIFY);
        return modifiedEntities;
    }

    public replaceByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, action: (entity: ENTITY) => ENTITY): ENTITY[] {
        const queryResult = query.run(this.storage, args);

        if (queryResult === null) {
            return [];

        } else if (Array.isArray(queryResult)) {
            const entities = queryResult as ENTITY[];
            const modifiedEntities: ENTITY[] = [];
            const modifiedIds: ID[] = [];
            for (let entity of entities) {
                const modified = action(entity);
                const id = this.idProvider(entity);
                this.storage.replace(id, modified);
                modifiedEntities.push(modified);
                modifiedIds.push(id);
            }
            this.notify(modifiedEntities, modifiedIds, DatabaseOperation.MODIFY);
            return modifiedEntities;

        } else {
            const entity = queryResult as ENTITY;
            const modified = action(entity);
            const id = this.idProvider(entity);
            this.storage.replace(id, modified);
            this.notify([modified], [id], DatabaseOperation.MODIFY);
            return [modified];
        }
    }


    //==== QUERY ===========================================================

    public count(): number {
        return this.storage.count();
    }

    public queryById(id: ID): ENTITY | null {
        return this.storage.get(id);
    }

    public queryMany<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY[] {
        const queryResult = query.run(this.storage, args);
        if (queryResult === null) {
            return [];
        } else if (Array.isArray(queryResult)) {
            return queryResult;
        } else {
            return [queryResult];
        }
    }

    public querySingle<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY | null {
        const queryResult = this.queryMany(query, args);
        if (queryResult === null) {
            return null;
        } else if (Array.isArray(queryResult)) {
            return queryResult.length > 0 ? queryResult[0] : null;
        } else {
            return queryResult;
        }
    }

    public querySingleOrThrow<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY {
        const result = this.querySingle(query, args);
        if (result === null) {
            throw new Error("No entity returned by query with args " + args);
        } else {
            return result;
        }
    }

}
