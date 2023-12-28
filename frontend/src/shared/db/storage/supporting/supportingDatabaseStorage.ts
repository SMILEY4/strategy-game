interface SupportingDatabaseStorage<ENTITY> {
    onInsert(entity: ENTITY): void;
    onInsertMany(entities: ENTITY[]): void;
    onDelete(entity: ENTITY): void;
    onDeleteMany(entities: ENTITY[]): void;
    onDeleteAll(): void;
    onModify(prev: ENTITY, next: ENTITY): void
}