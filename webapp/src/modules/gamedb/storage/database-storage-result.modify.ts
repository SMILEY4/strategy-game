/**
 * Result of an operation that modified exactly one entity.
 */
export interface ModifyDatabaseStorageResult<ENTITY, ID> {
    readonly id: ID
    readonly original: ENTITY,
    readonly replacement: ENTITY,
}