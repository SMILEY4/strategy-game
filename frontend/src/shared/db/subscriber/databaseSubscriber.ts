import {DatabaseOperation} from "../database/databaseOperation";
import {DatabaseStorage} from "../storage/databaseStorage";
import {Query} from "../query/query";

export interface DbSubscriber<ENTITY> {
    callback: (entities: ENTITY[], operation: DatabaseOperation) => void;
}

export interface QuerySubscriber<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID> {
    query: Query<STORAGE, ENTITY, ID, any>,
    args: any,
    callback: (entities: ENTITY[]) => void,
    lastIds: ID[]
}

export interface EntitySubscriber<ENTITY, ID> {
    entityId: ID,
    callback: (entity: ENTITY, operation: DatabaseOperation) => void
}
