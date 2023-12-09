import {IndexDefinitions} from "./dbIndex";
import {DbStorage} from "./dbStorage";
import {Query} from "./query";

export class QueryExecutor<ENTITY, INDEX extends IndexDefinitions<ENTITY>> {

    public query<ARG, OUT>(
        storage: DbStorage<ENTITY>,
        indexDefinition: INDEX,
        query: Query<ENTITY, INDEX, ARG, OUT>,
        arg: ARG,
    ): OUT {
        if (query.matchMultiple) {
            return this.queryHandleMultiple(storage, indexDefinition, query, arg);
        } else if (query.matchSingle) {
            return this.queryHandleSingle(storage, indexDefinition, query, arg);
        } else {
            return this.queryHandleAll(storage, query);
        }
    }

    private queryHandleMultiple<ARG, OUT>(
        storage: DbStorage<ENTITY>,
        indexDefinition: INDEX,
        query: Query<ENTITY, INDEX, ARG, OUT>,
        arg: ARG,
    ): OUT {
        if (query.matchMultiple) {

            const result: ENTITY[] = [];

            let count = 0;
            query.matchMultiple(indexDefinition, arg)(entityId => {
                const entity = this.resolveEntity(storage, entityId);

                if (!this.matchesFilters(entity, query.filters)) {
                    return false;
                }

                count++;
                if (query.take && count > query.take) {
                    return true;
                }

                if (query.iterator) {
                    query.iterator(entity);
                }
                if (query.return) {
                    result.push(entity);
                }

                return false;
            });

            if (query.return) {
                return result as OUT;
            } else {
                return undefined as OUT;
            }

        } else {
            throw new Error("match missing");
        }
    }

    private queryHandleSingle<ARG, OUT>(
        storage: DbStorage<ENTITY>,
        indexDefinition: INDEX,
        query: Query<ENTITY, INDEX, ARG, OUT>,
        arg: ARG,
    ): OUT {
        if (query.matchSingle) {

            let result = undefined;

            const entityId = query.matchSingle(indexDefinition, arg);
            if (entityId !== undefined) {
                const entity = this.resolveEntity(storage, entityId);
                if (this.matchesFilters(entity, query.filters)) {
                    if (query.iterator) {
                        query.iterator(entity);
                    }
                    if (query.return) {
                        result = entity;
                    }
                }
            }

            if (query.return) {
                return result as OUT;
            } else {
                return undefined as OUT;
            }

        } else {
            throw new Error("match missing");
        }
    }

    private queryHandleAll<ARG, OUT>(
        storage: DbStorage<ENTITY>,
        query: Query<ENTITY, INDEX, ARG, OUT>,
    ): OUT {
        const result: ENTITY[] = [];
        const entities = storage.getAll();

        let count = 0;
        for (const entity of entities) {

            if (!this.matchesFilters(entity, query.filters)) {
                continue;
            }

            count++;
            if (query.take && count > query.take) {
                break;
            }

            if (query.iterator) {
                query.iterator(entity);
            }
            if (query.return) {
                result.push(entity);
            }
        }

        if (query.return) {
            return result as OUT;
        } else {
            return undefined as OUT;
        }
    }

    private resolveEntity(storage: DbStorage<ENTITY>, entityId: string): ENTITY {
        const entity = storage.get(entityId);
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