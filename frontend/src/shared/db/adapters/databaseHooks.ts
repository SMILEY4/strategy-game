import {useEffect, useState} from "react";
import {UID} from "../../uid";
import {PrimaryDatabaseStorage} from "../storage/primary/primaryDatabaseStorage";
import {Database} from "../database/database";
import {DatabaseOperation} from "../database/databaseOperation";
import {Query} from "../query/query";
import {SingletonDatabase} from "../database/singletonDatabase";

/**
 * Stores the state and forces a re-render on every set (independent of value)
 * @param initial the initial value
 * @return array of ["current value", "setter"]
 */
function useForceRepaintState<T>(initial: T): [T, (item: T) => void] {
    const [data, setData] = useState<{ refId: string, item: T }>({refId: UID.generate(), item: initial});
    useEffect(() => {
        setData({refId: UID.generate(), item: initial})
    }, [initial]);
    return [
        data.item,
        (item: T) => setData({refId: UID.generate(), item: item}),
    ];
}

/**
 * Access (and watch) the entity in a given singleton-database
 * @param db the database
 * @return the current singleton entity
 */
export function useSingletonEntity<ENTITY>(db: SingletonDatabase<ENTITY>): ENTITY {
    const [entity, setEntity] = useForceRepaintState<ENTITY>(db.get());
    useEffect(() => {
        const subscriberId = db.subscribe(entity => setEntity(entity));
        return () => db.unsubscribe(subscriberId);
    }, []);
    return entity;
}

/**
 * Access (and watch) an entity in the given database by its id
 * @param db the database
 * @param id the id of the entity
 * @return the current entity or null
 */
export function useEntity<STORAGE extends PrimaryDatabaseStorage<ENTITY, ID>, ENTITY, ID>(
    db: Database<STORAGE, ENTITY, ID>,
    id: ID,
): ENTITY | null {
    const [entity, setEntity] = useForceRepaintState<ENTITY | null>(db.queryById(id));
    useEffect(() => {
        const subscriberId = db.subscribeOnEntity(id, (entity, op) => {
            if (op === DatabaseOperation.DELETE) {
                setEntity(null);
            } else {
                setEntity(entity);
            }
        });
        return () => db.unsubscribe(subscriberId);
    }, []);
    return entity;
}

/**
 * Access (and watch) an entity in the given database provided by the given query
 * @param db the database
 * @param query the query
 * @param args the dynamic arguments of the query
 * @return the current resulting entity or null
 */
export function useQuerySingle<STORAGE extends PrimaryDatabaseStorage<ENTITY, ID>, ENTITY, ID, ARGS>(
    db: Database<STORAGE, ENTITY, ID>,
    query: Query<STORAGE, ENTITY, ID, ARGS>,
    args: ARGS,
): ENTITY | null {
    const [entity, setEntity] = useForceRepaintState<ENTITY | null>(db.querySingle(query, args));
    useEffect(() => {
        const subscriberId = db.subscribeOnQuerySingle(query, args, result => setEntity(result));
        return () => db.unsubscribe(subscriberId);
    }, []);
    return entity;
}

/**
 * Access (and watch) an entity in the given database provided by the given query. Throw if no entity was found.
 * @param db the database
 * @param query the query
 * @param args the dynamic arguments of the query
 * @return the current resulting entity
 */
export function useQuerySingleOrThrow<STORAGE extends PrimaryDatabaseStorage<ENTITY, ID>, ENTITY, ID, ARGS>(
    db: Database<STORAGE, ENTITY, ID>,
    query: Query<STORAGE, ENTITY, ID, ARGS>,
    args: ARGS,
): ENTITY {
    const entity = useQuerySingle(db, query, args);
    if (entity !== null) {
        return entity;
    } else {
        throw new Error("No entity found by query with args " + args);
    }
}


/**
 * Access (and watch) entities in the given database provided by the given query
 * @param db the database
 * @param query the query
 * @param args the dynamic arguments of the query
 * @return the current resulting entities
 */
export function useQueryMultiple<STORAGE extends PrimaryDatabaseStorage<ENTITY, ID>, ENTITY, ID, ARGS>(
    db: Database<STORAGE, ENTITY, ID>,
    query: Query<STORAGE, ENTITY, ID, ARGS>,
    args: ARGS,
): ENTITY[] {
    const [entities, setEntities] = useForceRepaintState<ENTITY[]>(db.queryMany(query, args));
    useEffect(() => {
        const subscriberId = db.subscribeOnQuery(query, args, result => setEntities(result));
        return () => db.unsubscribe(subscriberId);
    }, []);
    return entities;
}
