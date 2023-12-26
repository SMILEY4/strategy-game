import {IndexDefinitions} from "./dbIndex";
import {DbStorage} from "./dbStorage";
import {QueryExecutor} from "./queryExecutor";
import {Query} from "./query";
import {UID} from "../uid";
import {DeleteManyResult, DeleteResult, InsertManyResult, InsertResult} from "./insertResult";

interface DBQuerySubscriber<ENTITY, INDEX extends IndexDefinitions<ENTITY>> {
    query: Query<ENTITY, INDEX, any, any>,
    arg: any,
    callback: (result: any) => void
}


interface DBEntitySubscriber<ENTITY> {
    entityId: string,
    callback: (entity: ENTITY) => void
}


export class Database<ENTITY, INDEX extends IndexDefinitions<ENTITY>> {

    readonly queryExecutor: QueryExecutor<ENTITY, INDEX> = new QueryExecutor();

    readonly subscriptionsQuery = new Map<string, DBQuerySubscriber<ENTITY, INDEX>>;
    readonly subscriptionsEntities = new Map<string, DBEntitySubscriber<ENTITY>>;


    readonly storage: DbStorage<ENTITY>;
    readonly indexDefinition: INDEX;


    constructor(storage: DbStorage<ENTITY>, indexDefinition: INDEX) {
        this.storage = storage;
        this.indexDefinition = indexDefinition;
    }


    //==================//
    //      INSERT      //
    //==================//

    /**
     * Insert the given entity.
     * @param entity the entity to insert
     * @return the result of the insert
     */
    public insert(entity: ENTITY): InsertResult<ENTITY> {
        const result = this.storage.insert(entity);
        if (result.inserted) {
            this.insertIntoIndices(entity, result.entityId);

            for (const [_, subscriber] of this.subscriptionsEntities) {
                if (subscriber.entityId == result.entityId) {
                    subscriber.callback(result.entity);
                }
            }

        }
        return result;
    }

    /**
     * Insert the given entities.
     * @param entities the entities to insert
     * @return the result of the insert
     */
    public insertMany(entities: ENTITY[]): InsertManyResult<ENTITY> {
        const result = this.storage.insertMany(entities);
        for (let i = 0, n = result.insertedEntities.length; i < n; i++) {
            const entityId = result.insertedIds[i];
            const entity = result.insertedEntities[i];
            this.insertIntoIndices(entity, entityId);
        }
        this.checkSubscriptionsOnInsertMany(result);
        return result;
    }


    //==================//
    //     DELETE       //
    //==================//

    /**
     * Delete the entity with the given entity-id
     * @param entityId the entity-id of the entity to delete
     * @return the deleted entity or null, if no entity for the id exists
     */
    public delete(entityId: string): DeleteResult<ENTITY> {
        const result = this.storage.delete(entityId);
        if (result.deleted) {
            this.deleteFromIndices(result.entity!, entityId);
            this.checkSubscriptionsOnDelete(result);
        }
        return result;
    }

    /**
     * Delete the entities for the given entity-ids
     * @param entityIds the entity-ids of the entities to delete
     * @return the deleted entities (or null if no entity for the id exists)
     */
    public deleteMany(entityIds: string[]): DeleteManyResult<ENTITY> {
        const result = this.storage.deleteMany(entityIds);
        for (let i = 0, n = result.deletedEntities.length; i < n; i++) {
            const entityId = result.deletedIds[i];
            const entity = result.deletedEntities[i];
            this.deleteFromIndices(entity, entityId);
        }
        this.checkSubscriptionsOnDeleteMany(result);
        return result;
    }

    //==================//
    //      UPDATE      //
    //==================//

    // todo

    //==================//
    //        GET       //
    //==================//

    /**
     * Retrieve the entity with the given entity-id
     * @param entityId the entity-id of the requested entity
     * @return the entity or null, if no entity with the given id exists
     */
    public get(entityId: string): ENTITY | null {
        return this.storage.get(entityId);
    }

    /**
     * Retrieve the entities with the given entity-ids
     * @param entityIds the entity-ids of the requested entities
     * @return the entities (or null of no entity with the id exists) for the given entity-ids
     */
    public getMany(entityIds: string[]): (ENTITY | null)[] {
        return this.storage.getMany(entityIds);
    }

    /**
     * Retrieve the entities with the given entity-ids
     * @param entityIds the entity-ids of the requested entities
     * @return the existing entities for the given entity-ids
     */
    public getManyNoNulls(entityIds: string[]): ENTITY[] {
        return this.storage.getManyNoNulls(entityIds);
    }

    /**
     * Retrieve all stored entities
     * @return all entities
     */
    public getAll(): ENTITY[] {
        return this.storage.getAll();
    }


    //==================//
    //      QUERY       //
    //==================//

    public query<ARG, OUT>(query: Query<ENTITY, INDEX, ARG, OUT>, arg: ARG): OUT {
        return this.queryExecutor.query(this.storage, this.indexDefinition, query, arg);
    }


    //==================//
    //     SUBSCRIBE    //
    //==================//

    public subscribeOnQuery<ARG, OUT extends ENTITY | ENTITY[]>(query: Query<ENTITY, INDEX, ARG, OUT>, arg: ARG, callback: (result: OUT) => void): string {
        const subscriberId = UID.generate();
        this.subscriptionsQuery.set(subscriberId, {
            query: query,
            arg: arg,
            callback: callback,
        });
        return subscriberId;
    }

    public subscribeOnEntity(entityId: string, callback: (entity: ENTITY) => void): string {
        const subscriberId = UID.generate();
        this.subscriptionsEntities.set(subscriberId, {
            entityId: entityId,
            callback: callback,
        });
        return subscriberId;
    }

    public unsubscribe(subscriberId: string) {
        this.subscriptionsQuery.delete(subscriberId);
        this.subscriptionsEntities.delete(subscriberId);
    }


    private checkQuerySubscriptions(relevantEntityIds: string[]) {
        for (const [_, subscriber] of this.subscriptionsQuery) {
            const queryResult = this.query<any, any>(subscriber.query, subscriber.arg);
            if (Array.isArray(queryResult)) {
                const specQueryResult = queryResult as ENTITY[]
                subscriber.callback(specQueryResult);
            } else {
                const specQueryResult = queryResult as ENTITY
                subscriber.callback(specQueryResult);
            }
        }
    }

    //==================//
    //     INDICES      //
    //==================//

    private insertIntoIndices(entity: ENTITY, entityId: string) {
        for (let indexName in this.indexDefinition) {
            const index = this.indexDefinition[indexName];
            index.insert(entity, entityId);
        }
    }

    private deleteFromIndices(entity: ENTITY, entityId: string) {
        for (let indexName in this.indexDefinition) {
            const index = this.indexDefinition[indexName];
            index.delete(entity, entityId);
        }
    }

    private rebuildIndices(prevEntity: ENTITY, newEntity: ENTITY, entityId: string) {
        this.deleteFromIndices(prevEntity, entityId);
        this.insertIntoIndices(newEntity, entityId);
    }

}