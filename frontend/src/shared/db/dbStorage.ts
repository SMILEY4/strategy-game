import {UID} from "../uid";

export interface DbStorage<T> {
    insert: (entity: T) => string;
    insertMany: (entities: T[]) => string[];
    get: (id: string) => T | null;
    getMany: (ids: string[]) => (T | null)[];
    getManyNoNulls: (ids: string[]) => T[];
    getAll: () => T[];
    delete: (id: string) => T | null;
    deleteMany: (ids: string[]) => (T | null)[];
}


export class MapStorage<T> implements DbStorage<T> {

    private readonly entities = new Map<string, T>();

    public insert(entity: T, id?: string): string {
        const entityId: string = id || UID.generate();
        if (this.entities.has(entityId)) {
            throw new Error("DuplicateKey: entity with id " + entityId + " already exists.");
        }
        this.entities.set(entityId, entity);
        return entityId;
    }

    public insertMany(entities: T[]): string[] {
        const entityIds: string[] = [];
        for (const entity of entities) {
            entityIds.push(this.insert(entity));
        }
        return entityIds;
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

    public delete(id: string): T | null {
        const entity = this.get(id);
        if (entity !== null) {
            this.entities.delete(id);
            return entity;
        } else {
            return null;
        }
    }

    public deleteMany(ids: string[]): (T | null)[] {
        const deleted: (T | null)[] = [];
        for (const id of ids) {
            const entity = this.get(id);
            if (entity !== null) {
                this.entities.delete(id);
                deleted.push(entity);
            } else {
                deleted.push(null)
            }
        }
        return deleted;
    }

}