import type {SupportingDatabaseStorageUnit} from "@modules/gamedb/storage/database-storage-unit.supporting.ts";

/**
 * Maps arbitrary keys to entities in an n-1 key-entity-relation
 * - multiple keys map to one entity
 * - single key can not map to multiple entities.
 */
export class MapUniqueMultikeySupportingStorage<ENTITY, KEY> implements SupportingDatabaseStorageUnit<ENTITY> {

    private readonly keyProvider: (entity: ENTITY) => KEY[];
    private readonly entities = new Map<KEY, ENTITY>();

    constructor(keyProvider: (entity: ENTITY) => KEY[]) {
        this.keyProvider = keyProvider;
    }


    //==== SPECIALIZED STORAGE OPERATIONS ==================================

    public getByKey(key: KEY): ENTITY | null {
        const entity = this.entities.get(key);
        if (entity === undefined) {
            return null;
        } else {
            return entity;
        }
    }


    //==== INTERNAL ========================================================

    private set(keys: KEY[], entity: ENTITY): void {
        for (const key of keys) {
            this.entities.set(key, entity)
        }
    }

    private delete(keys: KEY[]): void {
        for (const key of keys) {
            this.entities.delete(key)
        }
    }

    public onInsert(entity: ENTITY): void {
        this.set(this.keyProvider(entity), entity)
    }

    public onInsertMany(entities: ENTITY[]): void {
        for (const entity of entities) {
            this.set(this.keyProvider(entity), entity)
        }
    }

    public onDelete(entity: ENTITY): void {
        this.delete(this.keyProvider(entity));
    }

    public onDeleteMany(entities: ENTITY[]): void {
        for (const entity of entities) {
            this.delete(this.keyProvider(entity));
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