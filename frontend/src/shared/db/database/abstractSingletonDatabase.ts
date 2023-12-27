import {SingletonDatabase} from "./singletonDatabase";
import {UID} from "../../uid";
import {SingletonSubscriber} from "../subscriber/databaseSubscriber";

/**
 * Base implementation of a singleton database
 */
export class AbstractSingletonDatabase<ENTITY> implements SingletonDatabase<ENTITY> {

    private entity: ENTITY;

    private readonly subscribers = new Map<string, SingletonSubscriber<ENTITY>>();

    private transactionContext: null | { modified: boolean } = null;

    /**
     * @param initialValue the initial value of the entity
     */
    constructor(initialValue: ENTITY) {
        this.entity = initialValue;
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
        this.subscribers.set(subscriberId, {
            callback: callback,
        });
        return subscriberId;
    }

    public unsubscribe(subscriberId: string): void {
        this.subscribers.delete(subscriberId);
    }

    private genSubscriberId(): string {
        return UID.generate();
    }

    private notify() {
        if (this.transactionContext !== null) {
            this.transactionContext.modified = true;
        } else {
            this.checkSubscribers()
        }
    }

    private checkSubscribers() {
        for (let [_, subscriber] of this.subscribers) {
            subscriber.callback(this.entity);
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