import {DatabaseStorage} from "./databaseStorage";

export class MapDatabaseStorage<ENTITY, ID> implements DatabaseStorage<ENTITY, ID> {

    private readonly entities = new Map<ID, ENTITY>();
    private readonly idProvider: (entity: ENTITY) => ID;

    constructor(idProvider: (entity: ENTITY) => ID) {
        this.idProvider = idProvider;
    }

    public insert(entity: ENTITY): ID {
        const id = this.idProvider(entity);
        this.entities.set(id, entity);
        return id;
    }

    public insertMany(entities: ENTITY[]): ID[] {
        const ids: ID[] = [];
        for (let entity of entities) {
            ids.push(this.insert(entity));
        }
        return ids;
    }

    public delete(id: ID): ENTITY | null {
        const entity = this.entities.get(id);
        if (entity !== undefined) {
            this.entities.delete(id);
            return entity;
        } else {
            return null;
        }
    }

    public deleteMany(ids: ID[]): ENTITY[] {
        const deletedEntities: ENTITY[] = [];
        for (let id of ids) {
            const deleted = this.delete(id);
            if (deleted !== null) {
                deletedEntities.push(deleted);
            }
        }
        return deletedEntities;
    }

    public deleteAll(): ENTITY[] {
        const deletedEntities = this.getAll();
        this.entities.clear();
        return deletedEntities;
    }

    public replace(id: ID, replacement: ENTITY): void {
        if (this.entities.has(id)) {
            this.entities.set(id, replacement);
        }
    }


    public count(): number {
        return this.entities.size;
    }

    public getById(id: ID): ENTITY | null {
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

    public iterate(): IterableIterator<ENTITY> {
        return this.entities.values();
    }

}