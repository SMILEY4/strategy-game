/**
 * Stores all entities in a single array
 */
export class ArraySupportingStorage<ENTITY> implements SupportingDatabaseStorage<ENTITY> {

    private entities: ENTITY[] = [];

    //==== OPERATIONS ======================================================

    public getAll(): ENTITY[] {
        return this.entities
    }

    //==== INTERNAL ========================================================

    public onInsert(entity: ENTITY): void {
        this.entities.push(entity);
    }

    public onInsertMany(entities: ENTITY[]): void {
        this.entities.push(...entities);
    }

    public onDelete(entity: ENTITY): void {
        const index = this.entities.indexOf(entity);
        this.entities.splice(index, 1);
    }

    public onDeleteMany(entities: ENTITY[]): void {
        this.entities = this.entities.filter(e => e !== entities);
    }

    public onDeleteAll(): void {
        this.entities = [];
    }

    public onModify(prev: ENTITY, next: ENTITY): void {
        const index = this.entities.indexOf(prev);
        this.entities[index] = next;
    }

}