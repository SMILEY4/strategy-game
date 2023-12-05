import {EntityStorage, MapEntityStorage} from "./storage";
import {Query} from "./query";
import {UID} from "../uid";
import {QueryProcessor} from "./queryProcessor";
import {DBIndex} from "./dbIndex";
import {QueryExecutor} from "./queryExecutor";

export class Database<T> {

    private readonly storage: EntityStorage<T> = new MapEntityStorage();
    private readonly indices: DBIndex[] = [];

    private readonly queryProcessor: QueryProcessor<T> = new QueryProcessor();
    private readonly queryExecutor: QueryExecutor<T> = new QueryExecutor();

    public createIndex(index: DBIndex) {
        this.indices.push(index);
    }

    public insert(entity: T): string {
        const id = UID.generate();
        this.storage.insert(id, entity);
        return id;
    }


    public delete(id: string): T | null {
        return this.storage.delete(id);
    }


    public getAll(): T[] {
        return this.storage.getAll();
    }

    public query(query: Query<T>): T[] {
        const indexPlan = this.queryProcessor.process(query, this.indices);
        return this.queryExecutor.execute(query, indexPlan, this.storage, this.indices);
    }

}




