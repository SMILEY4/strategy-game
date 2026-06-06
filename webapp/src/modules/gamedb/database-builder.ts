import {DatabaseStorage, type DatabaseStorageUnitMapping} from "@/modules/gamedb/storage/database-storage.ts";
import type {IdProvider} from "@/modules/gamedb/storage/id-provider.ts";
import type {Database} from "@/modules/gamedb/database/database.ts";
import {DatabaseImpl} from "@/modules/gamedb/database/database-implementation.ts";
import {SingletonDatabaseImpl} from "@/modules/gamedb/singleton/singleton-database-implementation.ts";
import type {SingletonDatabase} from "@/modules/gamedb/singleton/singleton-database.ts";


export const DatabaseBuilder = {

    create<ENTITY, ID, STORAGE extends DatabaseStorageUnitMapping<ENTITY, ID>>(): StandardDatabaseBuilder<ENTITY, ID, STORAGE> {
        return new StandardDatabaseBuilder<ENTITY, ID, STORAGE>();
    },

    createSingleton<ENTITY>(): SingletonDatabaseBuilder<ENTITY> {
        return new SingletonDatabaseBuilder<ENTITY>();
    }

}

export class StandardDatabaseBuilder<
    ENTITY,
    ID,
    STORAGE extends DatabaseStorageUnitMapping<ENTITY, ID>
> {

    private _storageMapping: STORAGE | null = null;
    private _idProvider: IdProvider<ENTITY, ID> | null = null;

    public withStorage(storage: STORAGE): StandardDatabaseBuilder<ENTITY, ID, STORAGE> {
        this._storageMapping = storage;
        return this;
    }

    public withIdProvider(provider: IdProvider<ENTITY, ID>): StandardDatabaseBuilder<ENTITY, ID, STORAGE> {
        this._idProvider = provider;
        return this;
    }

    public build(): Database<STORAGE, ENTITY, ID> {
        if (!this._storageMapping) {
            throw new Error("Storage must be defined");
        }
        if (!this._idProvider) {
            throw new Error("Id provider must be defined");
        }
        const storage = new DatabaseStorage<STORAGE, ENTITY, ID>(this._storageMapping);
        return new DatabaseImpl<STORAGE, ENTITY, ID>(storage, this._idProvider);
    }

}

export class SingletonDatabaseBuilder<ENTITY> {

    private _initialValue: ENTITY | null = null;

    public withInitialValue(initial: ENTITY): SingletonDatabaseBuilder<ENTITY> {
        this._initialValue = initial;
        return this;
    }


    public build(): SingletonDatabase<ENTITY> {
        if (!this._initialValue) {
            throw new Error("Initial value must be defined");
        }
        return new SingletonDatabaseImpl<ENTITY>(this._initialValue);
    }

}