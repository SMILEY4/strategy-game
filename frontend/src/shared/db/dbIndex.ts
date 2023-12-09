import {BTreeMap} from "btreemap";

export type IndexDefinitions<ENTITY> = {
    [K: string]: DbIndex<ENTITY, any>
}

export interface IndexConfig<ENTITY, K> {
    keyProvider: (entity: ENTITY) => K;
}

export type IndexSingleResponse = string | undefined

export type IndexMultiResponse = (callback: (entityId: string) => boolean) => void


export interface DbIndex<ENTITY, K> {
    insert: (entity: ENTITY, entityId: string) => void,
    delete: (entity: ENTITY, entityId: string) => void,
}


export class MapIndex<ENTITY, K> implements DbIndex<ENTITY, K> {

    private readonly config: IndexConfig<ENTITY, K>;
    private readonly entries = new Map<K, string>();

    constructor(config: IndexConfig<ENTITY, K>) {
        this.config = config;
    }


    public insert(entity: ENTITY, entityId: string) {
        const key = this.config.keyProvider(entity);
        this.entries.set(key, entityId);
    }

    public delete(entity: ENTITY, entityId: string) {
        const key = this.config.keyProvider(entity);
        if (this.entries.get(key) === entityId) {
            this.entries.delete(key);
        }
    }

    public get(key: K): IndexSingleResponse {
        // todo: request of already exists
        return this.entries.get(key);
    }

}


export class BTreeIndex<ENTITY, K> implements DbIndex<ENTITY, K> {

    private readonly config: IndexConfig<ENTITY, K>;
    private readonly entries = new BTreeMap();

    constructor(config: IndexConfig<ENTITY, K>) {
        this.config = config;
    }


    public insert(entity: ENTITY, entityId: string) {
        const key = this.config.keyProvider(entity);
        this.entries.set(key, entityId);
    }

    public delete(entity: ENTITY, entityId: string) {
        const key = this.config.keyProvider(entity);
        const remaining: string[] = [];
        this.getRange(key, key)(id => {
            if (id !== entityId) {
                remaining.push(entityId);
            }
            return false;
        });
        this.entries.delete(key);
        for (const r of remaining) {
            this.entries.set(key, r);
        }
    }

    public getRange(start: K, end: K): IndexMultiResponse {
        return (callback: (entityId: string) => boolean) => {
            for (const entityId of this.entries.get(start, end)) {
                if (callback(entityId)) {
                    break;
                }
            }
        };
    }


}