/**
 * A subscriber listening to changes of a singleton-database
 */
export interface SingletonSubscriber<ENTITY> {
    callback: (entity: ENTITY) => void
}