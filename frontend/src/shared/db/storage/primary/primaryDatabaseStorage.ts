export interface ManyDatabaseStorageResult<ENTITY, ID> {
    entities: ENTITY[],
    ids: ID[]
}

export interface SingleDatabaseStorageResult<ENTITY, ID> {
    entity: ENTITY,
    id: ID
}

export interface ModifyDatabaseStorageResult<ENTITY, ID> {
    id: ID
    original: ENTITY,
    replacement: ENTITY,
}

export interface PrimaryDatabaseStorage<ENTITY, ID> {
    /**
     * Insert the given entity if it does not exist yet.
     * @param entity the entity to insert
     * @return the id of the inserted entity or null
     */
    insert(entity: ENTITY): SingleDatabaseStorageResult<ENTITY, ID> | null;

    /**
     * Insert the given entities (if they do not exist yet).
     * @param entities the entities to insert
     * @return the ids of the inserted entities
     */
    insertMany(entities: ENTITY[]): ManyDatabaseStorageResult<ENTITY, ID>;

    /**
     * Delete the entity with the given id
     * @param id the id of the entity to delete
     * @return the deleted entity or null
     */
    delete(id: ID): SingleDatabaseStorageResult<ENTITY, ID> | null;

    /**
     * Delete the entities with the given ids
     * @param ids the ids of the entities to delete
     * @return the deleted entities
     */
    deleteMany(ids: ID[]): ManyDatabaseStorageResult<ENTITY, ID>;

    /**
     * Delete all entities
     * @return the deleted entities
     */
    deleteAll(): ManyDatabaseStorageResult<ENTITY, ID>;

    /**
     * Replaces the entity with the given id with the new given entity
     * @param id the id of the original entity
     * @param replacement the entity to replace the original one with
     * @return the new entity or null
     */
    replace(id: ID, replacement: ENTITY): ModifyDatabaseStorageResult<ENTITY, ID> | null;

    /**
     * Retrieve an entity by its id
     * @param id the id of the entity
     * @return the entity with the given id or null
     */
    get(id: ID): ENTITY | null;

    /**
     * Counts all stored entities
     * @return the amount of stored documents
     */
    count(): number;

}