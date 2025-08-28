/**
 * Maps arbitrary keys to entities in a n-m key-entity-relation, i.e. a multiple keys map to one entity. A single key can map to multiple entities.
 */
export class MapMultikeySupportingStorage<ENTITY, KEY> implements SupportingDatabaseStorage<ENTITY> {

    private readonly keyProvider: (entity: ENTITY) => KEY[];
    private readonly entities = new Map<KEY, ENTITY[]>();

    constructor(keyProvider: (entity: ENTITY) => KEY[]) {
        this.keyProvider = keyProvider;
    }


    //==== OPERATIONS ======================================================

    public getByKey(key: KEY): ENTITY[] {
        const entities = this.entities.get(key);
        if (entities === undefined) {
            return [];
        } else {
            return entities;
        }
    }

    public getOneByKey(key: KEY): ENTITY | null {
        const entities = this.entities.get(key);
        if (entities === undefined || entities.length === 0) {
            return null;
        } else {
            return entities[0];
        }
    }


    //==== INTERNAL ========================================================

    public onInsert(entity: ENTITY): void {
        const keys = this.keyProvider(entity);
        for (let key of keys) {
            const array = this.entities.get(key);
            if (array === undefined) {
                this.entities.set(key, [entity]);
            } else {
                array.push(entity);
            }
        }
    }

    public onInsertMany(entities: ENTITY[]): void {
        for (let entity of entities) {
            this.onInsert(entity);
        }
    }

    public onDelete(entity: ENTITY): void {
        const keys = this.keyProvider(entity);
        for (let key of keys) {
            const array = this.entities.get(key);
            if (array === undefined) {
                return;
            } else if (array.length == 1) {
                this.entities.delete(key);
            } else {
                const index = array.indexOf(entity);
                array.splice(index, 1);
            }
        }
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