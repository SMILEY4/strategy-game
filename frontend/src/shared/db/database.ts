import {IndexDefinitions} from "./dbIndex";
import {DbStorage} from "./dbStorage";
import {QueryExecutor} from "./queryExecutor";
import {Query} from "./query";
import {UID} from "../uid";

interface DBSubscriber<ENTITY, INDEX extends IndexDefinitions<ENTITY>> {
    query: Query<ENTITY, INDEX, any, any>,
    arg: any,
    callback: (result: any) => void
}

export class Database<ENTITY, INDEX extends IndexDefinitions<ENTITY>> {

    readonly queryExecutor: QueryExecutor<ENTITY, INDEX> = new QueryExecutor();
    readonly subscriptions = new Map<string, DBSubscriber<ENTITY, INDEX>>;

    readonly storage: DbStorage<ENTITY>;
    readonly indexDefinition: INDEX;

    constructor(storage: DbStorage<ENTITY>, indexDefinition: INDEX) {
        this.storage = storage;
        this.indexDefinition = indexDefinition;
    }


    //==================//
    //      INSERT      //
    //==================//

    public insert(entity: ENTITY): string {
        const entityId = this.storage.insert(entity);
        this.insertIntoIndices(entity, entityId);
        this.checkAndTriggerSubscribers();
        return entityId;
    }

    public insertMany(entities: ENTITY[]): string[] {
        const entityIds = this.storage.insertMany(entities);
        for (const entityId of entityIds) {
            const entity = this.storage.get(entityId);
            if (entity !== null) {
                this.insertIntoIndices(entity, entityId);
            }
        }
        this.checkAndTriggerSubscribers();
        return entityIds;
    }


    //==================//
    //     DELETE       //
    //==================//

    public delete(entityId: string): ENTITY | null {
        const entity = this.storage.delete(entityId);
        if (entity !== null) {
            this.deleteFromIndices(entity, entityId);
        }
        this.checkAndTriggerSubscribers();
        return entity;
    }

    public deleteMany(entityIds: string[]): (ENTITY | null)[] {
        const entities = this.storage.deleteMany(entityIds);
        for (let i = 0; i < entityIds.length; i++) {
            const entity = entities[i];
            if (entity !== null) {
                this.deleteFromIndices(entity, entityIds[i]);
            }
        }
        this.checkAndTriggerSubscribers();
        return entities;
    }

    //==================//
    //      UPDATE      //
    //==================//

    // TODO


    //==================//
    //        GET       //
    //==================//

    public get(entityId: string): ENTITY | null {
        return this.storage.get(entityId);
    }

    public getMany(entityIds: string[]): (ENTITY | null)[] {
        return this.storage.getMany(entityIds);
    }

    public getManyNoNulls(entityIds: string[]): ENTITY[] {
        return this.storage.getManyNoNulls(entityIds);
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

    public subscribe<ARG, OUT>(query: Query<ENTITY, INDEX, ARG, OUT>, arg: ARG, callback: (result: OUT) => void): string {
        const subscriberId = UID.generate();
        this.subscriptions.set(subscriberId, {
            query: query,
            arg: arg,
            callback: callback,
        });
        return subscriberId;
    }


    public unsubscribe(subscriberId: string) {
        this.subscriptions.delete(subscriberId);
    }

    //==================//
    //     INTERNAL     //
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

    private checkAndTriggerSubscribers() {
        for (const [_, subscriber] of this.subscriptions) {
            // todo: subscribe to specific entityIds
            const result = this.query<any, any>(subscriber.query, subscriber.arg);
            subscriber.callback(result);
        }
    }

}