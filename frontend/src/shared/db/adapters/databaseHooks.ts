import {useEffect, useState} from "react";
import {UID} from "../../uid";
import {DatabaseStorage} from "../storage/databaseStorage";
import {Database} from "../database/database";
import {DatabaseOperation} from "../database/databaseOperation";
import {Query} from "../query/query";

export function useForceRepaintState<T>(initial: T): [T, (item: T) => void] {
    const [data, setData] = useState<{ refId: string, item: T }>({refId: UID.generate(), item: initial});
    return [
        data.item,
        (item: T) => setData({refId: UID.generate(), item: item}),
    ];
}

export function useEntity<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID>(
    db: Database<STORAGE, ENTITY, ID>,
    id: ID,
): ENTITY | null {
    const [entity, setEntity] = useForceRepaintState<ENTITY | null>(null);
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


export function useQuerySingle<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID, ARGS>(
    db: Database<STORAGE, ENTITY, ID>,
    query: Query<STORAGE, ENTITY, ID, ARGS>,
    args: ARGS,
): ENTITY | null {
    const entities = useQueryMultiple(db, query, args);
    if (entities.length > 0) {
        return entities[0];
    } else {
        return null;
    }
}


export function useQueryMultiple<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID, ARGS>(
    db: Database<STORAGE, ENTITY, ID>,
    query: Query<STORAGE, ENTITY, ID, ARGS>,
    args: ARGS,
): ENTITY[] {
    const [entities, setEntities] = useForceRepaintState<ENTITY[]>([]);
    useEffect(() => {
        const subscriberId = db.subscribeOnQuery(query, args, entities => setEntities(entities));
        return () => db.unsubscribe(subscriberId);
    }, []);
    return entities;
}
