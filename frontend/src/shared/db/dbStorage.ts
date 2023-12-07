import {UID} from "../uid";

export interface DbStorage<T> {
    insert: (entity: T) => void;
    delete: (id: string) => void;
    get: (id: string) => T | null;
}


export class MapStorage<T> implements DbStorage<T> {

    private readonly entities = new Map<string, T>();

    public insert(entity: T, id?: string) {
        const entityId: string = id || UID.generate();
        this.entities.set(entityId, entity);
    }

    public delete(id: string): void {
        this.entities.delete(id);
    }

    public get(id: string): T | null {
        const entity = this.entities.get(id);
        if (entity === undefined) {
            return null;
        } else {
            return entity;
        }
    }

}