import type {SupportingDatabaseStorageUnit} from "@modules/gamedb/storage/database-storage-unit.supporting.ts";
import type {PrimaryDatabaseStorageUnit} from "@modules/gamedb/storage/database-storage-unit.primary.ts";
import type {SingleDatabaseStorageResult} from "@modules/gamedb/storage/database-storage-result.single.ts";
import type {ManyDatabaseStorageResult} from "@modules/gamedb/storage/database-storage-result.many.ts";
import type {ModifyDatabaseStorageResult} from "@modules/gamedb/storage/database-storage-result.modify.ts";


export type DatabaseStorageUnitMapping<ENTITY, ID> =
    Record<string, PrimaryDatabaseStorageUnit<ENTITY, ID> | SupportingDatabaseStorageUnit<ENTITY>>

/**
 * Stores database entities.
 * Uses one primary storage unit and any amount of additional supporting storage units for specialized access patterns.
 */
export class DatabaseStorage<MAPPING extends DatabaseStorageUnitMapping<ENTITY, ID>, ENTITY, ID> implements PrimaryDatabaseStorageUnit<ENTITY, ID> {

    private readonly storageUnits: MAPPING;
    private readonly primaryStorage: PrimaryDatabaseStorageUnit<ENTITY, ID>;
    private readonly supportingStorages: SupportingDatabaseStorageUnit<ENTITY>[] = [];

    constructor(storageUnits: MAPPING) {
        this.storageUnits = storageUnits;
        this.primaryStorage = storageUnits["primary"] as PrimaryDatabaseStorageUnit<ENTITY, ID>;
        this.supportingStorages = Object
            .values(storageUnits)
            .filter(it => it != storageUnits.primary) as SupportingDatabaseStorageUnit<ENTITY>[]
    }

    public getStorage(): MAPPING {
        return this.storageUnits;
    }

    public insert(entity: ENTITY): SingleDatabaseStorageResult<ENTITY, ID> | null {
        const result = this.primaryStorage.insert(entity);
        if (result !== null && this.supportingStorages) {
            for (const supporting of this.supportingStorages) {
                supporting.onInsert(entity);
            }
        }
        return result;
    }

    public insertMany(entities: ENTITY[]): ManyDatabaseStorageResult<ENTITY, ID> {
        const result = this.primaryStorage.insertMany(entities);
        if (result.entities.length > 0 && this.supportingStorages) {
            for (const supporting of this.supportingStorages) {
                supporting.onInsertMany(result.entities);
            }
        }
        return result;
    }

    public delete(id: ID): SingleDatabaseStorageResult<ENTITY, ID> | null {
        const result = this.primaryStorage.delete(id);
        if (result !== null && this.supportingStorages) {
            for (const supporting of this.supportingStorages) {
                supporting.onDelete(result.entity);
            }
        }
        return result;
    }

    public deleteMany(ids: ID[]): ManyDatabaseStorageResult<ENTITY, ID> {
        const result = this.primaryStorage.deleteMany(ids);
        if (result.entities.length > 0 && this.supportingStorages) {
            for (const supporting of this.supportingStorages) {
                supporting.onDeleteMany(result.entities);
            }
        }
        return result;
    }

    public deleteAll(): ManyDatabaseStorageResult<ENTITY, ID> {
        const result = this.primaryStorage.deleteAll();
        if (result.entities.length > 0 && this.supportingStorages) {
            for (const supporting of this.supportingStorages) {
                supporting.onDeleteAll();
            }
        }
        return result;
    }

    public replace(id: ID, replacement: ENTITY): ModifyDatabaseStorageResult<ENTITY, ID> | null {
        const result = this.primaryStorage.replace(id, replacement);
        if (result !== null && this.supportingStorages) {
            for (const supporting of this.supportingStorages) {
                supporting.onModify(result.original, result.replacement);
            }
        }
        return result;
    }

    public get(id: ID): ENTITY | null {
        return this.primaryStorage.get(id);
    }

    public count(): number {
        return this.primaryStorage.count();
    }

}