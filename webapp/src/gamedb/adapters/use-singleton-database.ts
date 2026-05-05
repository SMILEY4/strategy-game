import type {SingletonDatabase} from "@gamedb/singleton/singleton-database.ts";
import {useEffect, useRef, useState} from "react";

/**
 * Access (and watch) the entity in a given singleton-database
 * @param db the database
 * @return the current singleton entity
 */
export function useSingletonEntity<ENTITY>(db: SingletonDatabase<ENTITY>): ENTITY {
    const [entity, setEntity] = useState<ENTITY>(() => db.get());
    useEffect(() => {
        const subscription = db.subscribe((entity) => setEntity(entity));
        return () => db.unsubscribe(subscription);
    }, [db]);
    return entity;
}

/**
 * Access (and watch) part of the entity in a given singleton-database
 * @param db the database
 * @param selector selected the value to watch from the current entity
 * @param equality (optional) a custom equality function. This prevents re-renders when the selector returns new (but "equal") objects.
 * @return the current partial value of the singleton entity
 */
export function usePartialSingletonEntity<ENTITY, T>(
    db: SingletonDatabase<ENTITY>,
    selector: (entity: ENTITY) => T,
    equality: (a: T, b: T) => boolean = (a, b) => a === b,
): T {
    const [entity, setEntity] = useState<T>(() => selector(db.get()));

    const selectorRef = useRef(selector);
    const equalityRef = useRef(equality);

    useEffect(() => {
        selectorRef.current = selector;
        equalityRef.current = equality;
    });

    useEffect(() => {
        const subscription = db.subscribe((entity) => {
            const nextPartial = selectorRef.current(entity);
            setEntity((prevPartial) => {
                if (equalityRef.current(prevPartial, nextPartial)) {
                    return prevPartial;
                } else {
                    return nextPartial;
                }
            });
        });
        return () => db.unsubscribe(subscription);
    }, [db]);

    return entity;
}