/**
 * A subscriber listening to changes of a specific value in a singleton-database
 */
export interface PartialSingletonSubscriber<ENTITY, T> {
    selector: (entity: ENTITY) => T,
    callback: (value: T) => void
    lastValue: T
}