import {
    ManyDatabaseStorageResult,
    ModifyDatabaseStorageResult,
    PrimaryDatabaseStorage,
    SingleDatabaseStorageResult,
} from "./primaryDatabaseStorage";
import {IdProvider} from "../../idProvider";

/**
 * Maps a unique id to a unique entity
 */
export class MapPrimaryStorage<ENTITY, ID> implements PrimaryDatabaseStorage<ENTITY, ID> {

    private readonly entities = new Map<ID, ENTITY>();
    private readonly idProvider: IdProvider<ENTITY, ID>;

    constructor(idProvider: IdProvider<ENTITY, ID>) {
        this.idProvider = idProvider;
    }

    public insert(entity: ENTITY): SingleDatabaseStorageResult<ENTITY, ID> | null {
        const id = this.idProvider(entity);
        if (this.entities.has(id)) {
            return null;
        } else {
            this.entities.set(id, entity);
            return {id: id, entity: entity};
        }
    }

    public insertMany(entities: ENTITY[]): ManyDatabaseStorageResult<ENTITY, ID> {
        const result: ManyDatabaseStorageResult<ENTITY, ID> = {
            entities: [],
            ids: [],
        };
        for (let entity of entities) {
            const id = this.idProvider(entity);
            if (!this.entities.has(id)) {
                this.entities.set(id, entity);
                result.entities.push(entity);
                result.ids.push(id);
            }
        }
        return result;
    }

    public delete(id: ID): SingleDatabaseStorageResult<ENTITY, ID> | null {
        const entity = this.entities.get(id);
        if (entity !== undefined) {
            this.entities.delete(id);
            return {
                id: id,
                entity: entity,
            };
        } else {
            return null;
        }
    }

    public deleteMany(ids: ID[]): ManyDatabaseStorageResult<ENTITY, ID> {
        const result: ManyDatabaseStorageResult<ENTITY, ID> = {
            entities: [],
            ids: [],
        };
        for (let id of ids) {
            const entity = this.entities.get(id);
            if (entity !== undefined) {
                this.entities.delete(id);
                result.entities.push(entity);
                result.ids.push(id);
            }
        }
        return result;
    }

    public deleteAll(): ManyDatabaseStorageResult<ENTITY, ID> {
        const entities = this.getAll();
        const ids = IdProvider.toIds(this.idProvider, entities);
        this.entities.clear();
        return {entities: entities, ids: ids};
    }

    public replace(id: ID, replacement: ENTITY): ModifyDatabaseStorageResult<ENTITY, ID> | null {
        if (this.idProvider(replacement) !== id) {
            return null;
        }
        const original = this.entities.get(id);
        if (original !== undefined) {
            this.entities.set(id, replacement);
            return {id: id, original: original, replacement: replacement};
        } else {
            return null;
        }
    }

    public get(id: ID): ENTITY | null {
        const entity = this.entities.get(id);
        if (entity !== undefined) {
            return entity;
        } else {
            return null;
        }
    }

    public getAll(): ENTITY[] {
        return Array.from(this.entities.values());
    }

    public count(): number {
        return this.entities.size;
    }

}