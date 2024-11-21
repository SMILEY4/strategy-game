import {TransactionObject} from "./transaction";

/**
 * A database storing a single entity
 */
export interface SingletonDatabase<ENTITY> extends TransactionObject {

    /**
     * Get the current revision id. The revision id get updated every time the entity changes
     * @return the current revision id
     */
    getRevId(): string;

    /**
     * Register a new partial revision id with the given name.
     * @param name the unique name of the partial revision id
     * @param selector select the part to apply the partial revision id to
     */
    registerPartialRevId<T>(name: string, selector: (entity: ENTITY) => T): void;

    /**
     * Get the current revision id for a part of the entity.
     * The revision id get updated every time the selected part of the entity changes.
     * The partial revision id must be registered first.
     * @param name the name of the partial revision id
     * @return the current revision id of the selected part
     */
    getPartialRevId(name: string): string;

    /**
     * Perform the given action in a "transaction". All changes are collected and subscribers are notified after the action.
     * @param action the action to perform inside the "transaction"
     */
    transaction(action: () => void): void;

    /**
     * Subscribe to changes
     * @param callback the event callback
     */
    subscribe(callback: (entity: ENTITY) => void): string;

    /**
     * Subscribe to changed of a specific value
     * @param selector select the value to listen to
     * @param callback the event callback
     */
    subscribePartial<T>(selector: (entity: ENTITY) => T, callback: (value: T) => void): string;

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