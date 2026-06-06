/**
 * Result of an operation that is associated with exactly one entity.
 */
export interface SingleDatabaseStorageResult<ENTITY, ID> {
    readonly entity: ENTITY,
    readonly id: ID
}