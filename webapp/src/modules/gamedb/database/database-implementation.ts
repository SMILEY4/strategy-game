import type {Database} from "@modules/gamedb/database/database.ts";
import {type IdProvider, IdProviderUtils} from "@modules/gamedb/storage/id-provider.ts";
import type {EntitySubscriber} from "@modules/gamedb/subscribers/subscriber-entity.ts";
import type {QuerySubscriber} from "@modules/gamedb/subscribers/subscriber-query.ts";
import type {DatabaseSubscriber} from "@modules/gamedb/subscribers/subscriber-database.ts";
import {DatabaseOperation} from "@modules/gamedb/database/database-operation.ts";
import type {Query} from "@modules/gamedb/database/query.ts";
import {DatabaseStorage, type DatabaseStorageUnitMapping} from "@modules/gamedb/storage/database-storage.ts";

interface PartialRevId<ENTITY> {
    name: string,
    revId: string,
    filter: (entity: ENTITY) => boolean
}

/**
 * Base implementation of a database
 */
export class DatabaseImpl<STORAGE extends DatabaseStorageUnitMapping<ENTITY, ID>, ENTITY, ID> implements Database<STORAGE, ENTITY, ID> {

    private readonly storage: DatabaseStorage<STORAGE, ENTITY, ID>;

    private readonly idProvider: IdProvider<ENTITY, ID>;

    private readonly subscribers = {
        db: new Map<string, DatabaseSubscriber<ENTITY>>,
        entity: new Map<string, EntitySubscriber<ENTITY, ID>>,
        query: new Map<string, QuerySubscriber<STORAGE, ENTITY, ID, unknown>>,
    };

    private revId: string = DatabaseImpl.generateRevId()

    private partialRevIds: Map<string, PartialRevId<ENTITY>> = new Map()

    private batchContext: null | {
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
    constructor(storage: DatabaseStorage<STORAGE, ENTITY, ID>, idProvider: IdProvider<ENTITY, ID>) {
        this.storage = storage;
        this.idProvider = idProvider;
    }

    public getStorage(): DatabaseStorage<STORAGE, ENTITY, ID> {
        return this.storage;
    }

    //==== REVISION ID =====================================================

    public getRevId(): string {
        return this.revId;
    }

    private updateRevId() {
        this.revId = DatabaseImpl.generateRevId()
    }

    public registerPartialRevId(name: string, filter: (entity: ENTITY) => boolean): void {
        this.partialRevIds.set(name, {
            name: name,
            revId: DatabaseImpl.generateRevId(),
            filter: filter
        })
    }

    public getPartialRevId(name: string): string {
        const partialRevId = this.partialRevIds.get(name);
        if(partialRevId) {
            return partialRevId.revId
        } else {
            throw new Error("No partial revId with name " + name + " registered.");
        }
    }

    private checkPartialRevIds(entities: ENTITY | ENTITY[]): void {
        for (const partialRevId of this.partialRevIds.values()) {
            let isRelevant = false
            if(Array.isArray(entities)) {
                for (const entity of entities) {
                    if(partialRevId.filter(entity)) {
                        isRelevant = true
                        break
                    }
                }
            } else {
                isRelevant = partialRevId.filter(entities)
            }
            if(isRelevant) {
                partialRevId.revId = DatabaseImpl.generateRevId()
            }
        }
    }

    private static generateRevId(): string {
        return Date.now() + "-" + Math.round(Math.random() * 1_000_000);
    }

    //==== BATCH ===========================================================

    public startBatch() {
        this.batchContext = {
            changed: false,
            insertedEntities: [],
            insertedIds: [],
            deletedEntities: [],
            deletedIds: [],
            modifiedEntities: [],
            modifiedIds: [],
        };
    }

    public endBatch() {
        try {
            if (this.batchContext !== null && this.batchContext.changed) {
                this.updateRevId();
                this.checkSubscribersQuery(true);
                this.checkSubscribersEntity(this.batchContext.deletedEntities, this.batchContext.deletedIds, DatabaseOperation.DELETE);
                this.checkSubscribersEntity(this.batchContext.modifiedEntities, this.batchContext.modifiedIds, DatabaseOperation.MODIFY);
                this.checkSubscribersEntity(this.batchContext.insertedEntities, this.batchContext.insertedIds, DatabaseOperation.INSERT);
                this.checkSubscribersDb(this.batchContext.deletedEntities, DatabaseOperation.DELETE);
                this.checkSubscribersDb(this.batchContext.modifiedEntities, DatabaseOperation.MODIFY);
                this.checkSubscribersDb(this.batchContext.insertedEntities, DatabaseOperation.INSERT);
            }
        } finally {
            this.batchContext = null;
        }
    }

    public batch(action: () => void) {
        try {
            this.startBatch();
            action();
        } finally {
            this.endBatch();
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

    public subscribeOnEntity(entityId: ID, callback: (entity: ENTITY, operation: DatabaseOperation) => void): [string, ENTITY | null] {
        const subscriberId = this.genSubscriberId();
        const entity = this.getStorage().get(entityId);
        this.subscribers.entity.set(subscriberId, {
            entityId: entityId,
            callback: callback,
        });
        return [subscriberId, entity];
    }

    public subscribeOnQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, callback: (entities: ENTITY[]) => void): [string, ENTITY[]] {
        const subscriberId = this.genSubscriberId();
        const queryResult = this.queryMany(query, args);
        this.subscribers.query.set(subscriberId, {
            query: query,
            args: args,
            callback: callback,
            lastIds: IdProviderUtils.toIds(this.idProvider, queryResult),
        });
        return [subscriberId, queryResult];
    }

    public subscribeOnQuerySingle<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, callback: (entity: ENTITY | null) => void): [string, ENTITY | null] {
        const subscriberId = this.genSubscriberId();
        const queryResult = this.querySingle(query, args);
        this.subscribers.query.set(subscriberId, {
            query: query,
            args: args,
            callback: entities => entities.length > 0 ? callback(entities[0]) : callback(null),
            lastIds: queryResult === null ? [] : IdProviderUtils.toIds(this.idProvider, [queryResult]),
        });
        return [subscriberId, queryResult];
    }

    public unsubscribe(subscriberId: string): void {
        this.subscribers.db.delete(subscriberId);
        this.subscribers.entity.delete(subscriberId);
        this.subscribers.query.delete(subscriberId);
    }

    private genSubscriberId(): string {
        return Date.now() + "-" + Math.round(Math.random() * 1_000_000);
    }

    private notify(entities: ENTITY[], ids: ID[], operation: DatabaseOperation) {
        if (this.batchContext && ids.length > 0) {
            this.batchContext.changed = true;
            switch (operation) {
                case DatabaseOperation.INSERT: {
                    this.batchContext.insertedIds.push(...ids);
                    this.batchContext.insertedEntities.push(...entities);
                    break;
                }
                case DatabaseOperation.DELETE: {
                    this.batchContext.deletedIds.push(...ids);
                    this.batchContext.deletedEntities.push(...entities);
                    break;
                }
                case DatabaseOperation.MODIFY: {
                    this.batchContext.modifiedIds.push(...ids);
                    this.batchContext.modifiedEntities.push(...entities);
                    break;
                }
                default: {
                    throw new Error("Unhandled database-operation: " + operation);
                }
            }
        } else {
            if (ids.length > 0) {
                this.updateRevId();
            }
            this.checkSubscribersQuery(operation === DatabaseOperation.MODIFY);
            this.checkSubscribersEntity(entities, ids, operation);
            this.checkSubscribersDb(entities, operation);
        }
    }


    private checkSubscribersQuery(force: boolean) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, subscriber] of this.subscribers.query) {
            this.checkSubscriberQuery(subscriber, force);
        }
    }

    private checkSubscriberQuery(subscriber: QuerySubscriber<STORAGE, ENTITY, ID, unknown>, force: boolean) {
        const result: ENTITY[] = this.queryMany(subscriber.query, subscriber.args);
        const resultIds = result.map(this.idProvider).sort();
        if (force || !this.arrEquals(subscriber.lastIds, resultIds)) {
            subscriber.lastIds = [...resultIds];
            subscriber.callback(result);
        }
    }

    private checkSubscribersEntity(entities: ENTITY[], ids: ID[], operation: DatabaseOperation) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, subscriber] of this.subscribers.entity) {
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
        for (const [_, subscriber] of this.subscribers.db) {
            subscriber.callback(entities, operation);
        }
    }

    private arrEquals(a: unknown[], b: unknown[]): boolean {
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
            this.checkPartialRevIds(result.entity)
            this.notify([result.entity], [result.id], DatabaseOperation.INSERT);
            return result.id;
        } else {
            return null;
        }
    }

    public insertMany(entities: ENTITY[]): ID[] {
        const result = this.storage.insertMany(entities);
        this.checkPartialRevIds(result.entities)
        this.notify(result.entities, result.ids, DatabaseOperation.INSERT);
        return result.ids;
    }

    //==== DELETE ==========================================================

    public delete(id: ID): ENTITY | null {
        const result = this.storage.delete(id);
        if (result) {
            this.checkPartialRevIds(result.entity)
            this.notify([result.entity], [result.id], DatabaseOperation.DELETE);
            return result.entity;
        } else {
            return null;
        }
    }

    public deleteMany(ids: ID[]): ENTITY[] {
        const result = this.storage.deleteMany(ids);
        this.checkPartialRevIds(result.entities)
        this.notify(result.entities, result.ids, DatabaseOperation.DELETE);
        return result.entities;
    }

    public deleteByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY[] {
        const queryIds = IdProviderUtils.toIds(this.idProvider, this.queryMany(query, args));
        const result = this.storage.deleteMany(queryIds);
        this.checkPartialRevIds(result.entities)
        this.notify(result.entities, result.ids, DatabaseOperation.DELETE);
        return result.entities;
    }

    public deleteAll(): ENTITY[] {
        const result = this.storage.deleteAll();
        this.checkPartialRevIds(result.entities)
        this.notify(result.entities, result.ids, DatabaseOperation.DELETE);
        return result.entities;
    }


    //==== UPDATE ==========================================================

    public update(id: ID, action: (entity: ENTITY) => Partial<ENTITY>): ENTITY | null {
        const entity = this.storage.get(id);
        if (entity !== null) {
            const modified = {...entity, ...action(entity)};
            this.storage.replace(id, modified);
            this.checkPartialRevIds([entity, modified])
            this.notify([modified], [id], DatabaseOperation.MODIFY);
            return modified;
        } else {
            return null;
        }
    }

    public updateMany(ids: ID[], action: (entity: ENTITY) => Partial<ENTITY>): ENTITY[] {
        const originalEntities: ENTITY[] = [];
        const modifiedEntities: ENTITY[] = [];
        const modifiedIds: ID[] = [];
        for (const id of ids) {
            const entity = this.storage.get(id);
            if (entity !== null) {
                modifiedEntities.push(entity);
                const modified = {...entity, ...action(entity)};
                this.storage.replace(id, modified);
                modifiedEntities.push(modified);
                modifiedIds.push(id);
            }
        }
        this.checkPartialRevIds([...originalEntities, ...modifiedEntities,])
        this.notify(modifiedEntities, modifiedIds, DatabaseOperation.MODIFY);
        return modifiedEntities;
    }

    public updateByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, action: (entity: ENTITY) => Partial<ENTITY>): ENTITY[] {
        const queryResult = query.run(this.storage.getStorage(), args);

        if (queryResult === null) {
            return [];

        } else if (Array.isArray(queryResult)) {
            const modifiedEntities: ENTITY[] = [];
            const modifiedIds: ID[] = [];
            for (const entity of queryResult as ENTITY[]) {
                const id = this.idProvider(entity);
                const modified = {...entity, ...action(entity)};
                this.storage.replace(id, modified);
                modifiedEntities.push(modified);
                modifiedIds.push(id);
            }
            this.checkPartialRevIds([...queryResult, ...modifiedEntities]);
            this.notify(modifiedEntities, modifiedIds, DatabaseOperation.MODIFY);
            return modifiedEntities;

        } else {
            const entity = queryResult as ENTITY;
            const id = this.idProvider(entity);
            const modified = {...entity, ...action(entity)};
            this.storage.replace(id, modified);
            this.checkPartialRevIds([entity, modified]);
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
            this.checkPartialRevIds([entity, modified]);
            this.notify([modified], [id], DatabaseOperation.MODIFY);
            return modified;
        } else {
            return null;
        }
    }

    public replaceMany(ids: ID[], action: (entity: ENTITY) => ENTITY): ENTITY[] {
        const originalEntities: ENTITY[] = [];
        const modifiedEntities: ENTITY[] = [];
        const modifiedIds: ID[] = [];
        for (const id of ids) {
            const entity = this.storage.get(id);
            if (entity !== null) {
                originalEntities.push(entity);
                const modified = action(entity);
                this.storage.replace(id, modified);
                modifiedEntities.push(modified);
                modifiedIds.push(id);
            }
        }
        this.checkPartialRevIds([...originalEntities, ...modifiedEntities]);
        this.notify(modifiedEntities, modifiedIds, DatabaseOperation.MODIFY);
        return modifiedEntities;
    }

    public replaceByQuery<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS, action: (entity: ENTITY) => ENTITY): ENTITY[] {
        const queryResult = query.run(this.storage.getStorage(), args);

        if (queryResult === null) {
            return [];

        } else if (Array.isArray(queryResult)) {
            const entities = queryResult as ENTITY[];
            const modifiedEntities: ENTITY[] = [];
            const modifiedIds: ID[] = [];
            for (const entity of entities) {
                const modified = action(entity);
                const id = this.idProvider(entity);
                this.storage.replace(id, modified);
                modifiedEntities.push(modified);
                modifiedIds.push(id);
            }
            this.checkPartialRevIds([...queryResult, ...modifiedEntities]);
            this.notify(modifiedEntities, modifiedIds, DatabaseOperation.MODIFY);
            return modifiedEntities;

        } else {
            const entity = queryResult as ENTITY;
            const modified = action(entity);
            const id = this.idProvider(entity);
            this.storage.replace(id, modified);
            this.checkPartialRevIds([entity, modified]);
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
        const queryResult = query.run(this.storage.getStorage(), args);
        if (queryResult === null) {
            return [];
        } else if (Array.isArray(queryResult)) {
            return queryResult;
        } else {
            return [queryResult];
        }
    }

    public querySingle<ARGS>(query: Query<STORAGE, ENTITY, ID, ARGS>, args: ARGS): ENTITY | null {
        const queryResult = query.run(this.storage.getStorage(), args);
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
