import type {Database} from "@modules/gamedb/database/database.ts";
import type {DatabaseStorageUnitMapping} from "@modules/gamedb/storage/database-storage.ts";
import {useEffect, useState} from "react";
import {DatabaseOperation} from "@modules/gamedb/database/database-operation.ts";
import type {Query} from "@modules/gamedb/database/query.ts";

/**
 * Access (and watch) an entity in the given database by its id
 * @param db the database
 * @param id the id of the entity
 * @return the current entity or null
 */
export function useEntity<STORAGE extends DatabaseStorageUnitMapping<ENTITY, ID>, ENTITY, ID>(db: Database<STORAGE, ENTITY, ID>, id: ID): ENTITY | null {
    const [entity, setEntity] = useState<ENTITY | null>(() => db.queryById(id));
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [subscription, _] = db.subscribeOnEntity(id, (entity, operation) => {
            console.log("notification", entity, operation);
            if (operation === DatabaseOperation.DELETE) {
                setEntity(null);
            } else {
                setEntity(entity);
            }
        });
        return () => db.unsubscribe(subscription);
    }, [db, id]);
    return entity;
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

    const [entity, setEntity] = useState<ENTITY | null>(() => db.querySingle(query, args));

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [subscription, _] = db.subscribeOnQuerySingle(query, args, entity => {
            setEntity(entity);
        });
        return () => db.unsubscribe(subscription);
    }, [db, query, args]);

    return entity;
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

    const [entities, setEntities] = useState<ENTITY[]>(() => db.queryMany(query, args));

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [subscription, _] = db.subscribeOnQuery(query, args, entities => {
            setEntities(entities);
        });
        return () => db.unsubscribe(subscription);
    }, [db, query, args]);

    return entities;
}

