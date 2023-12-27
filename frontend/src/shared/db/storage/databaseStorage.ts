export interface DatabaseStorage<ENTITY, ID> {
    /**
     * Insert the given entity
     * @param entity the entity to insert
     * @return the id of the inserted entity
     */
    insert(entity: ENTITY): ID;

    /**
     * Insert the given entities
     * @param entities the entities to insert
     * @return the ids of the inserted entities
     */
    insertMany(entities: ENTITY[]): ID[];

    /**
     * Delete the entity with the given id
     * @param id the id of the entity to delete
     * @return the deleted entity or null
     */
    delete(id: ID): ENTITY | null;

    /**
     * Delete the entities with the given ids
     * @param ids the ids of the entities to delete
     * @return the deleted entities
     */
    deleteMany(ids: ID[]): ENTITY[];

    /**
     * Delete all entities
     * @return the deleted entities
     */
    deleteAll(): ENTITY[];

    /**
     * Replaces the entity with the given id with the new given entity
     * @param id the id of the original entity
     * @param replacement the entity to replace the original one with
     */
    replace(id: ID, replacement: ENTITY): void

    /**
     * Counts all stored entities
     * @return the amount of stored documents
     */
    count(): number;

    /**
     * Retrieve an entity by its id
     * @param id the id of the entity
     * @return the entity with the given id or null
     */
    getById(id: ID): ENTITY | null;
}