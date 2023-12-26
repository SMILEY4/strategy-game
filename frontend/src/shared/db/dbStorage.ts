import {EntityIdProvider} from "./idprovider";
import {DeleteManyResult, DeleteResult, InsertManyResult, InsertResult} from "./insertResult";

export interface DbStorage<T> {
    /**
     * Insert the given entity.
     * @param entity the entity to insert
     * @return the result of the insert
     */
    insert: (entity: T) => InsertResult<T>;

    /**
     * Insert the given entities
     * @param entities the entities to insert
     * @return the result of the insert
     */
    insertMany: (entities: T[]) => InsertManyResult<T>;

    /**
     * Retrieve the entity with the given entity-id
     * @param id the entity-id of the requested entity
     * @return the entity or null, if no entity with the given id exists
     */
    get: (id: string) => T | null;

    /**
     * Retrieve the entities with the given entity-ids
     * @param ids the entity-ids of the requested entities
     * @return the entities (or null of no entity with the id exists) for the given entity-ids
     */
    getMany: (ids: string[]) => (T | null)[];

    /**
     * Retrieve the entities with the given entity-ids
     * @param ids the entity-ids of the requested entities
     * @return the existing entities for the given entity-ids
     */
    getManyNoNulls: (ids: string[]) => T[];

    /**
     * Retrieve all stored entities
     * @return all entities
     */
    getAll: () => T[];

    /**
     * Delete the entity with the given entity-id
     * @param id the entity-id of the entity to delete
     * @return the result of the deletion
     */
    delete: (id: string) =>DeleteResult<T>;

    /**
     * Delete the entities for the given entity-ids
     * @param ids the entity-ids of the entities to delete
     * @return the result of the deletion
     */
    deleteMany: (ids: string[]) => DeleteManyResult<T>;
}


export class MapStorage<T> implements DbStorage<T> {

    private readonly entities = new Map<string, T>();
    private readonly idProvider: EntityIdProvider<T>;

    constructor(idProvider: EntityIdProvider<T>) {
        this.idProvider = idProvider;
    }

    public insert(entity: T): InsertResult<T> {
        const entityId = this.idProvider(entity);
        if (this.entities.has(entityId)) {
            return {
                entity: entity,
                entityId: entityId,
                inserted: false,
            };
        } else {
            this.entities.set(entityId, entity);
            return {
                entity: entity,
                entityId: entityId,
                inserted: true,
            };
        }
    }

    public insertMany(entities: T[]): InsertManyResult<T> {
        const result: InsertManyResult<T> = {
            insertedIds: [],
            insertedEntities: [],
            skippedIds: [],
            skippedEntities: []
        }

        for (const entity of entities) {
            const insertOneResult = this.insert(entity);
            if (insertOneResult.inserted) {
                result.insertedIds.push(insertOneResult.entityId);
                result.insertedEntities.push(entity)
            } else {
                result.skippedIds.push(insertOneResult.entityId);
                result.skippedEntities.push(entity)
            }
        }
        return result
    }

    public get(id: string): T | null {
        const entity = this.entities.get(id);
        if (entity === undefined) {
            return null;
        } else {
            return entity;
        }
    }

    public getMany(ids: string[]): (T | null)[] {
        const result: (T | null)[] = [];
        for (const id of ids) {
            result.push(this.get(id));
        }
        return result;
    }

    public getManyNoNulls(ids: string[]): T[] {
        const result: T[] = [];
        for (const id of ids) {
            const entity = this.get(id);
            if (entity !== null) {
                result.push(entity);
            }
        }
        return result;
    }

    public getAll(): T[] {
        return Array.from(this.entities.values());
    }

    public delete(id: string): DeleteResult<T> {
        const entity = this.entities.get(id);
        if (entity !== undefined) {
            this.entities.delete(id);
            return {
                entity: entity,
                entityId: id,
                deleted: true
            }
        } else {
            return {
                entity: null,
                entityId: id,
                deleted: false
            }
        }
    }

    public deleteMany(ids: string[]): DeleteManyResult<T> {
        const result: DeleteManyResult<T> = {
            deletedIds: [],
            deletedEntities: [],
            skippedIds: [],
            skippedEntities: [],
        }
        for (const id of ids) {
            const entity = this.entities.get(id)
            if (entity !== undefined) {
                this.entities.delete(id);
                result.deletedIds.push(id)
                result.deletedEntities.push(entity)
            } else {
                result.skippedIds.push(id)
                result.skippedEntities.push(entity!)
            }
        }
        return result;
    }

}