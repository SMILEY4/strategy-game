import type {SingletonDatabase} from "@gamedb/singleton/singleton-database.ts";
import type {PartialSingletonSubscriber} from "@gamedb/subscribers/subscriber-singleton-partial.ts";
import type {SingletonSubscriber} from "@gamedb/subscribers/subscriber-singleton.ts";

interface PartialRevId<ENTITY, T> {
    name: string,
    revId: string,
    selector: (entity: ENTITY) => T,
    lastValue: T,
}

/**
 * Implementation of a singleton database
 */
export class SingletonDatabaseImpl<ENTITY> implements SingletonDatabase<ENTITY> {

    private entity: ENTITY;

    private revId: string = SingletonDatabaseImpl.generateRevId();

    private readonly subscribers = {
        entity: new Map<string, SingletonSubscriber<ENTITY>>(),
        partial: new Map<string, PartialSingletonSubscriber<ENTITY, unknown>>(),
    };

    private readonly partialRevIds = new Map<string, PartialRevId<ENTITY, unknown>>();

    private batchContext: null | { modified: boolean } = null;

    /**
     * @param initialValue the initial value of the entity
     */
    constructor(initialValue: ENTITY) {
        this.entity = initialValue;
    }

    //==== REVISION ID =====================================================

    public getRevId(): string {
        return this.revId;
    }

    public registerPartialRevId<T>(name: string, selector: (entity: ENTITY) => T) {
        this.partialRevIds.set(name, {
            revId: SingletonDatabaseImpl.generateRevId(),
            name: name,
            selector: selector,
            lastValue: selector(this.entity),
        });
    }

    public getPartialRevId(name: string): string {
        const partialRevId = this.partialRevIds.get(name);
        if (partialRevId) {
            // todo: can be optimized with dirty check
            //  1. store "dirty" flag for each partial rev id
            //  2. set dirty = true on modifications
            //  3. on get partial: is dirty: compare and return new revid, else: return current revid
            const currentValue = partialRevId.selector(this.entity);
            if (partialRevId.lastValue !== currentValue) {
                partialRevId.lastValue = currentValue;
                partialRevId.revId = SingletonDatabaseImpl.generateRevId();
            }
            return partialRevId.revId;
        } else {
            throw new Error("No partial revId with name " + name + " registered.");
        }
    }

    private updateRevId() {
        this.revId = SingletonDatabaseImpl.generateRevId()
    }

    private static generateRevId(): string {
        return Date.now() + "-" + Math.round(Math.random() * 1_000_000);
    }

    //==== TRANSACTION =====================================================

    public startBatch() {
        this.batchContext = {
            modified: false,
        };
    }

    public endBatch() {
        try {
            if (this.batchContext !== null && this.batchContext.modified) {
                this.updateRevId();
                this.checkSubscribers();
            }
        } finally {
            this.batchContext = null;
        }
    }

    public batch(action: () => void) {
        try {
            this.startBatch();
            action();
        } finally {
            this.endBatch();
        }
    }

    //==== SUBSCRIPTIONS ===================================================

    public subscribe(callback: (entity: ENTITY) => void): string {
        const subscriberId = this.genSubscriberId();
        this.subscribers.entity.set(subscriberId, {
            callback: callback,
        });
        return subscriberId;
    }

    public subscribePartial<T>(selector: (entity: ENTITY) => T, callback: (value: T) => void): string {
        const subscriberId = this.genSubscriberId();
        this.subscribers.partial.set(subscriberId, {
            selector: selector,
            callback: callback as ((value: unknown) => void),
            lastValue: this.entity,
        });
        return subscriberId;
    }

    public unsubscribe(subscriberId: string): void {
        this.subscribers.entity.delete(subscriberId);
        this.subscribers.partial.delete(subscriberId);
    }

    private genSubscriberId(): string {
        return Date.now() + "-" + Math.round(Math.random() * 1_000_000);
    }

    private notify() {
        if (this.batchContext !== null) {
            this.batchContext.modified = true;
        } else {
            this.updateRevId();
            this.checkSubscribers();
        }
    }

    private checkSubscribers() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, subscriber] of this.subscribers.entity) {
            subscriber.callback(this.entity);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, subscriber] of this.subscribers.partial) {
            const currentValue = subscriber.selector(this.entity);
            if (subscriber.lastValue !== currentValue) {
                subscriber.lastValue = currentValue;
                subscriber.callback(currentValue);
            }
        }
    }

    //==== OPERATIONS ======================================================

    public set(entity: ENTITY): void {
        this.entity = entity;
        this.notify();
    }

    public update(action: (entity: ENTITY) => Partial<ENTITY>): void {
        this.entity = {...this.entity, ...action(this.entity)};
        this.notify();
    }

    public get(): ENTITY {
        return this.entity;
    }

}