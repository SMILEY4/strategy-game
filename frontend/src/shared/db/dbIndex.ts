import {BTreeMap} from "btreemap";

export type IndexDefinitions = {
    [K: string]: DbIndex<any>
}

export type IndexSingleResponse = string | undefined

export type IndexMultiResponse = (callback: (entityId: string) => boolean) => void


export interface DbIndex<K> {
    insert: (key: K, entityId: string) => void,
}


export class MapIndex<K> implements DbIndex<K> {

    private readonly entries = new Map<K, string>();

    public insert(key: K, entityId: string) {
        this.entries.set(key, entityId);
    }


    public get(key: K): IndexSingleResponse {
        return this.entries.get(key);
    }

}


export class BTreeIndex<K> implements DbIndex<K> {

    private readonly entries = new BTreeMap();

    public insert(key: K, entityId: string) {
        this.entries.set(key, entityId);
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