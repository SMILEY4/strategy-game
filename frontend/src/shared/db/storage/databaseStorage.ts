import {
    ManyDatabaseStorageResult,
    ModifyDatabaseStorageResult,
    PrimaryDatabaseStorage,
    SingleDatabaseStorageResult,
} from "./primary/primaryDatabaseStorage";

export interface DatabaseStorageConfig<ENTITY, ID> {
    primary: PrimaryDatabaseStorage<ENTITY, ID>,
    supporting?: {
        [K: string]: SupportingDatabaseStorage<ENTITY>
    }
}

export class DatabaseStorage<CONFIG extends DatabaseStorageConfig<ENTITY, ID>, ENTITY, ID> implements PrimaryDatabaseStorage<ENTITY, ID> {

    readonly config: CONFIG;
    private readonly primaryStorage: PrimaryDatabaseStorage<ENTITY, ID>;
    private readonly supportingStorages: SupportingDatabaseStorage<ENTITY>[] = [];

    constructor(config: CONFIG) {
        this.config = config;
        this.primaryStorage = config.primary;
        if (config.supporting) {
            for (const [_, s] of Object.entries(config.supporting)) {
                this.supportingStorages.push(s);
            }
        }
    }

    public insert(entity: ENTITY): SingleDatabaseStorageResult<ENTITY, ID> | null {
        const result = this.config.primary.insert(entity);
        if (result !== null && this.supportingStorages) {
            for (let supporting of this.supportingStorages) {
                supporting.onInsert(entity);
            }
        }
        return result;
    }

    public insertMany(entities: ENTITY[]): ManyDatabaseStorageResult<ENTITY, ID> {
        const result = this.primaryStorage.insertMany(entities);
        if (result.entities.length > 0 && this.supportingStorages) {
            for (let supporting of this.supportingStorages) {
                supporting.onInsertMany(result.entities);
            }
        }
        return result;
    }

    public delete(id: ID): SingleDatabaseStorageResult<ENTITY, ID> | null {
        const result = this.primaryStorage.delete(id);
        if (result !== null && this.supportingStorages) {
            for (let supporting of this.supportingStorages) {
                supporting.onDelete(result.entity);
            }
        }
        return result;
    }

    public deleteMany(ids: ID[]): ManyDatabaseStorageResult<ENTITY, ID> {
        const result = this.primaryStorage.deleteMany(ids);
        if (result.entities.length > 0 && this.supportingStorages) {
            for (let supporting of this.supportingStorages) {
                supporting.onDeleteMany(result.entities);
            }
        }
        return result;
    }

    public deleteAll(): ManyDatabaseStorageResult<ENTITY, ID> {
        const result = this.primaryStorage.deleteAll();
        if (result.entities.length > 0 && this.supportingStorages) {
            for (let supporting of this.supportingStorages) {
                supporting.onDeleteAll();
            }
        }
        return result;
    }

    public replace(id: ID, replacement: ENTITY): ModifyDatabaseStorageResult<ENTITY, ID> | null {
        const result = this.primaryStorage.replace(id, replacement);
        if (result !== null && this.supportingStorages) {
            for (let supporting of this.supportingStorages) {
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