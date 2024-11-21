export type DatabaseOperation = "insert" | "delete" | "modify"

export namespace DatabaseOperation {
    /**
     * An entity/Entities was/were inserted
     */
    export const INSERT: DatabaseOperation = "insert"
    /**
     * An entity/Entities was/were deleted
     */
    export const DELETE: DatabaseOperation = "delete"
    /**
     * An entity/Entities was/were modified (updated or replaced)
     */
    export const MODIFY: DatabaseOperation = "modify"
}