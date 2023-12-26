export interface InsertResult<ENTITY> {
    entity: ENTITY,
    entityId: string,
    inserted: boolean
}

export interface InsertManyResult<ENTITY> {
    insertedIds: string[],
    insertedEntities: ENTITY[],
    skippedIds: string[],
    skippedEntities: ENTITY[]
}

export interface DeleteResult<ENTITY> {
    entity: ENTITY | null,
    entityId: string,
    deleted: boolean
}

export interface DeleteManyResult<ENTITY> {
    deletedIds: string[],
    deletedEntities: ENTITY[],
    skippedIds: string[],
    skippedEntities: ENTITY[]
}

