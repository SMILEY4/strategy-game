import {DbIndex, IndexDefinitions} from "./dbIndex";
import {DbStorage} from "./dbStorage";
import {Query} from "./queryBuilder";






export class Database<ENTITY, INDEX extends IndexDefinitions> {

    readonly storage: DbStorage<ENTITY>;
    readonly indexDefinition: INDEX;

    constructor(storage: DbStorage<ENTITY>, indexDefinition: INDEX) {
        this.storage = storage;
        this.indexDefinition = indexDefinition;
    }


    public subscribe<ARG, OUT>(query: Query<ENTITY, INDEX, ARG, OUT>, arg: ARG, callback: (result: OUT) => void): string {
        // TODO
        return "subscriberId"
    }

    public unsubscribe(subscriberId: string) {

    }

    public query<ARG, OUT>(query: Query<ENTITY, INDEX, ARG, OUT>, arg: ARG): OUT {
        if (query.matchMultiple) {
            return this.queryHandleMultiple(query, arg);
        } else {
            return this.queryHandleSingle(query, arg);
        }
    }

    private queryHandleMultiple<ARG, OUT>(query: Query<ENTITY, INDEX, ARG, OUT>, arg: ARG): OUT {
        if (query.matchMultiple) {

            const result: ENTITY[] = []

            let count = 0;
            query.matchMultiple(this.indexDefinition, arg)(entityId => {
                const entity = this.resolveEntity(entityId);
                if (!this.matchesFilters(entity, query.filters)) {
                    return false;
                }
                count++;
                if(query.take && count > query.take) {
                    return true
                }

                if(query.iterator) {
                    query.iterator(entity)
                }
                if(query.return) {
                    result.push(entity)
                }

                return false;
            });

            if(query.return) {
                return result as OUT
            } else {
                return undefined as OUT
            }

        } else {
            throw new Error("match missing");
        }
    }

    private queryHandleSingle<ARG, OUT>(query: Query<ENTITY, INDEX, ARG, OUT>, arg: ARG): OUT {
        if (query.matchSingle) {

            let result = undefined

            const entityId = query.matchSingle(this.indexDefinition, arg);
            if (entityId !== undefined) {
                const entity = this.resolveEntity(entityId);
                if (this.matchesFilters(entity, query.filters)) {
                    if(query.iterator) {
                        query.iterator(entity)
                    }
                    if(query.return) {
                        result = entity
                    }
                }
            }

            if(query.return) {
                return result as OUT
            } else {
                return undefined as OUT
            }

        } else {
            throw new Error("match missing");
        }
    }

    private resolveEntity(entityId: string): ENTITY {
        const entity = this.storage.get(entityId);
        if (entity) {
            return entity;
        } else {
            throw new Error("could not resolve entity-id " + entity);
        }
    }

    private matchesFilters(entity: ENTITY, filters: ((entity: ENTITY) => boolean)[]): boolean {
        for (const filter of filters) {
            if (!filter(entity)) {
                return false;
            }
        }
        return true;
    }

}