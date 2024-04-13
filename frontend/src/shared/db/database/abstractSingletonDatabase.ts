import {SingletonDatabase} from "./singletonDatabase";
import {UID} from "../../uid";
import {PartialSingletonSubscriber, SingletonSubscriber} from "../subscriber/databaseSubscriber";

interface PartialRevId<ENTITY, T> {
    name: string,
    revId: string,
    selector: (entity: ENTITY) => T,
    lastValue: T,
}

/**
 * Base implementation of a singleton database
 */
export class AbstractSingletonDatabase<ENTITY> implements SingletonDatabase<ENTITY> {

    private entity: ENTITY;

    private revId: string = UID.generate();

    private readonly subscribers = {
        entity: new Map<string, SingletonSubscriber<ENTITY>>(),
        partial: new Map<string, PartialSingletonSubscriber<ENTITY, any>>(),
    };

    private readonly partialRevIds = new Map<string, PartialRevId<ENTITY, any>>();

    private transactionContext: null | { modified: boolean } = null;

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
            revId: UID.generate(),
            name: name,
            selector: selector,
            lastValue: selector(this.entity),
        });
    }

    public getPartialRevId(name: string): string {
        const partialRevId = this.partialRevIds.get(name);
        if (partialRevId) {
            const currentValue = partialRevId.selector(this.entity);
            if (partialRevId.lastValue !== currentValue) {
                partialRevId.lastValue = currentValue;
                partialRevId.revId = UID.generate();
            }
            return partialRevId.revId;
        } else {
            throw new Error("No partial revId with name " + name + " registered.");
        }
    }

    private updateRevId() {
        this.revId = UID.generate();
    }

    //==== TRANSACTION =====================================================

    public startTransaction() {
        this.transactionContext = {
            modified: false,
        };
    }

    public endTransaction() {
        try {
            if (this.transactionContext !== null && this.transactionContext.modified) {
                this.updateRevId();
                this.checkSubscribers();
            }
        } finally {
            this.transactionContext = null;
        }
    }

    public transaction(action: () => void) {
        try {
            this.startTransaction();
            action();
        } finally {
            this.endTransaction();
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
            callback: callback,
            lastValue: this.entity,
        });
        return subscriberId;
    }

    public unsubscribe(subscriberId: string): void {
        this.subscribers.entity.delete(subscriberId);
        this.subscribers.partial.delete(subscriberId);
    }

    private genSubscriberId(): string {
        return UID.generate();
    }

    private notify() {
        if (this.transactionContext !== null) {
            this.transactionContext.modified = true;
        } else {
            this.updateRevId();
            this.checkSubscribers();
        }
    }

    private checkSubscribers() {
        for (let [_, subscriber] of this.subscribers.entity) {
            subscriber.callback(this.entity);
        }
        for (let [_, subscriber] of this.subscribers.partial) {
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