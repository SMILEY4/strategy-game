export const DatabaseOperation = {
    /** An entity/entities was/were inserted */
    INSERT: "insert",
    /** An entity/entities was/were deleted */
    DELETE: "delete",
    /** An entity/entities was/were modified (updated or replaced) */
    MODIFY: "modify",
} as const;

export type DatabaseOperation = typeof DatabaseOperation[keyof typeof DatabaseOperation]