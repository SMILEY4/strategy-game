export interface EntityStorage<T> {
    insert: (id: string, entity: T) => void;
    delete: (id: string) => T | null;
    getAll: () => T[];
}


export class MapEntityStorage<T> implements EntityStorage<T> {

    private readonly entities = new Map<string, T>();

    public insert(id: string, entity: T): void {
        this.entities.set(id, entity);
    }

    public delete(id: string): T | null {
        const entity = this.entities.get(id);
        if (entity === undefined) {
            return null;
        } else {
            this.entities.delete(id);
            return entity;
        }
    }

    public getAll(): T[] {
        return Array.from(this.entities.values());
    }

}
