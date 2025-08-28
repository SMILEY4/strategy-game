/**
 * Maps arbitrary keys to entities in a 1-1 key-entity-relation, i.e. a key maps to exactly one entity (or none).
 */
export class MapUniqueSupportingStorage<ENTITY, KEY> implements SupportingDatabaseStorage<ENTITY> {

    private readonly keyProvider: (entity: ENTITY) => KEY;
    private readonly entities = new Map<KEY, ENTITY>();

    constructor(keyProvider: (entity: ENTITY) => KEY) {
        this.keyProvider = keyProvider;
    }


    //==== OPERATIONS ======================================================

    public getByKey(key: KEY): ENTITY | null {
        const entity = this.entities.get(key);
        if (entity === undefined) {
            return null;
        } else {
            return entity;
        }
    }


    //==== INTERNAL ========================================================

    public onInsert(entity: ENTITY): void {
        this.entities.set(this.keyProvider(entity), entity);
    }

    public onInsertMany(entities: ENTITY[]): void {
        for (let entity of entities) {
            this.onInsert(entity);
        }
    }

    public onDelete(entity: ENTITY): void {
        this.entities.delete(this.keyProvider(entity));
    }

    public onDeleteMany(entities: ENTITY[]): void {
        for (let entity of entities) {
            this.onDelete(entity);
        }
    }

    public onDeleteAll(): void {
        this.entities.clear();
    }

    public onModify(prev: ENTITY, next: ENTITY): void {
        this.onDelete(prev);
        this.onInsert(next);
    }

}