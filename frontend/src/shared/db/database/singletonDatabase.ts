/**
 * A database storing a single entity
 */
export interface SingletonDatabase<ENTITY> {

    /**
     * Subscribe to changes
     * @param callback the event callback
     */
    subscribe(callback: (entity: ENTITY) => void): string;

    /**
     * Unsubscribe to changes
     * @param subscriberId
     */
    unsubscribe(subscriberId: string): void;

    /**
     * Set (replace) the entity
     * @param entity the (new) entity
     */
    set(entity: ENTITY): void;

    /**
     * Update the entity
     * @param action the update to perform. Returns a (partial) entity with new values that are merged into the original.
     * */
    update(action: (entity: ENTITY) => Partial<ENTITY>): void;

    /**
     * Get the entity.
     */
    get(): ENTITY;

}