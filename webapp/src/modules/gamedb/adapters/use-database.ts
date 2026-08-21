import type {Database} from "@modules/gamedb/database/database.ts";
import type {DatabaseStorageUnitMapping} from "@modules/gamedb/storage/database-storage.ts";
import {useEffect, useState} from "react";
import {DatabaseOperation} from "@modules/gamedb/database/database-operation.ts";
import type {Query} from "@modules/gamedb/database/query.ts";
import type {SingletonDatabase} from "@modules/gamedb/singleton/singleton-database.ts";

export interface RevisionDatabase {
    getRevId: () => string;
    subscribe: (callback: () => void) => string;
    unsubscribe: (subscriberId: string) => void;
}

/**
 * Watch a database revision and re-render when its contents change.
 * @param db the database to watch
 * @return the current database revision id
 */
export function useDatabaseRevId(db: RevisionDatabase): string {
    const [revId, setRevId] = useState<string>(() => db.getRevId());

    useEffect(() => {
        const subscription = db.subscribe(() => setRevId(db.getRevId()));
        return () => db.unsubscribe(subscription);
    }, [db]);

    return revId;
}

/**
 * Watch multiple databases and trigger re-render when any of them changes.
 * @param databases the databases to watch
 */
export function useWatchDatabases(databases: RevisionDatabase[]): void {
    const [, setRevision] = useState(0);

    useEffect(() => {
        const subscriptions = databases.map(db => db.subscribe(() => {
            setRevision(revision => revision + 1);
        }));

        return () => {
            databases.forEach((db, index) => db.unsubscribe(subscriptions[index]));
        };
    }, [databases]);
}

/**
 * Access (and watch) the content of the given singleton database
 * @param db the database
 * @return the current content
 */
export function useQuerySingleton<ENTITY>(db: SingletonDatabase<ENTITY>): ENTITY {
    const [entity, setEntity] = useState<ENTITY>(() => db.get());
    useEffect(() => {
        const subscription = db.subscribe(entity => setEntity(entity));
        return () => db.unsubscribe(subscription);
    }, [db]);
    return entity;
}

/**
 * Access (and watch) the partial content of the given singleton database
 * @param db the database
 * @param selector function taking the full db content and returns only the relevant part
 * @return the current partial content
 */
export function useQueryPartialSingleton<ENTITY, T>(db: SingletonDatabase<ENTITY>, selector: (entity: ENTITY) => T): T {
    const [value, setValue] = useState<T>(() => selector(db.get()));
    useEffect(() => {
        const subscription = db.subscribePartial(selector, entity => setValue(entity));
        return () => db.unsubscribe(subscription);
    }, [selector, db]);
    return value;
}

/**
 * Access (and watch) an entity in the given database by its id
 * @param db the database
 * @param id the id of the entity
 * @return the current entity or null
 */
export function useQueryEntity<STORAGE extends DatabaseStorageUnitMapping<ENTITY, ID>, ENTITY, ID>(db: Database<STORAGE, ENTITY, ID>, id: ID): ENTITY | null {
    const [snapshot, setSnapshot] = useState<{ id: ID, entity: ENTITY | null }>(() => ({
        id,
        entity: db.queryById(id),
    }));

    if (snapshot.id !== id) {
        setSnapshot({id, entity: db.queryById(id)});
    }

    useEffect(() => {
        const [subscription] = db.subscribeOnEntity(id, (entity, operation) => {
            if (operation === DatabaseOperation.DELETE) {
                setSnapshot({id, entity: null});
            } else {
                setSnapshot({id, entity});
            }
        });
        return () => db.unsubscribe(subscription);
    }, [db, id]);
    return snapshot.entity;
}

/**
 * Access (and watch) an entity in the given database provided by the given query
 * @param db the database
 * @param query the query
 * @param args the dynamic arguments of the query
 * @return the current resulting entity or null
 */
export function useQuerySingle<STORAGE extends DatabaseStorageUnitMapping<ENTITY, ID>, ENTITY, ID, ARGS>(
    db: Database<STORAGE, ENTITY, ID>,
    query: Query<STORAGE, ENTITY, ID, ARGS>,
    args: ARGS,
): ENTITY | null {
    const [snapshot, setSnapshot] = useState<{ args: ARGS, entity: ENTITY | null }>(() => ({
        args,
        entity: db.querySingle(query, args),
    }));

    if (snapshot.args !== args) {
        setSnapshot({args, entity: db.querySingle(query, args)});
    }

    useEffect(() => {
        const [subscription] = db.subscribeOnQuerySingle(query, args, entity => {
            setSnapshot({args, entity});
        });
        return () => db.unsubscribe(subscription);
    }, [db, query, args]);
    return snapshot.entity;
}


/**
 * Access (and watch) an entity in the given database provided by the given query. Throw if no entity was found.
 * @param db the database
 * @param query the query
 * @param args the dynamic arguments of the query
 * @return the current resulting entity
 */
export function useQuerySingleOrThrow<STORAGE extends DatabaseStorageUnitMapping<ENTITY, ID>, ENTITY, ID, ARGS>(
    db: Database<STORAGE, ENTITY, ID>,
    query: Query<STORAGE, ENTITY, ID, ARGS>,
    args: ARGS,
): ENTITY {
    const entity = useQuerySingle<STORAGE, ENTITY, ID, ARGS>(db, query, args);
    if (entity == null) {
        throw new Error("No entity found by query with args " + args);
    }
    return entity;
}


/**
 * Access (and watch) entities in the given database provided by the given query
 * @param db the database
 * @param query the query
 * @param args the dynamic arguments of the query
 * @return the current resulting entities
 */
export function useQueryMultiple<STORAGE extends DatabaseStorageUnitMapping<ENTITY, ID>, ENTITY, ID, ARGS>(
    db: Database<STORAGE, ENTITY, ID>,
    query: Query<STORAGE, ENTITY, ID, ARGS>,
    args: ARGS,
): ENTITY[] {

    const [snapshot, setSnapshot] = useState<{ args: ARGS, entities: ENTITY[] }>(() => ({
        args,
        entities: db.queryMany(query, args),
    }));

    if (snapshot.args !== args) {
        setSnapshot({args, entities: db.queryMany(query, args)});
    }

    useEffect(() => {
        const [subscription] = db.subscribeOnQuery(query, args, entities => {
            setSnapshot({args, entities});
        });
        return () => db.unsubscribe(subscription);
    }, [db, query, args]);

    return snapshot.entities;
}
