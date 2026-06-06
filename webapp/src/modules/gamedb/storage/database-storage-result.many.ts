/**
 * Result of an operation that is associated with multiple entities.
 */
export interface ManyDatabaseStorageResult<ENTITY, ID> {
    readonly entities: ENTITY[],
    readonly ids: ID[]
}