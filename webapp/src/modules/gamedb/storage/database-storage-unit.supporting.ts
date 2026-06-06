/**
 * Supporting storage unit for a database usually specialized for a single query pattern.
 * A database always needs exactly one primary storage unit but can have any amount of supporting storage units.
 * The primary storage is the "source of truth" and (successfully) applied operations on it are mirrored to all other supporting storage units.
 */
export interface SupportingDatabaseStorageUnit<ENTITY> {

    /**
     * An entity was inserted into the database.
     * Applies this operation to this supporting storage unit.
     */
    onInsert(entity: ENTITY): void;

    /**
     * Multiple entities were inserted into the database.
     * Applies this operation to this supporting storage unit.
     */
    onInsertMany(entities: ENTITY[]): void;

    /**
     * An entity was deleted from the database.
     * Applies this operation to this supporting storage unit.
     */
    onDelete(entity: ENTITY): void;

    /**
     * Multiple entities were deleted from the database.
     * Applies this operation to this supporting storage unit.
     */
    onDeleteMany(entities: ENTITY[]): void;

    /**
     * All entities were deleted from the database.
     * Applies this operation to this supporting storage unit.
     */
    onDeleteAll(): void;

    /**
     * An entity was modified/replaced in the database.
     * Applies this operation to this supporting storage unit.
     */
    onModify(prev: ENTITY, next: ENTITY): void
}