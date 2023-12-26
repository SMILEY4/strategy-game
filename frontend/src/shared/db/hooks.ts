import {Database} from "./database";
import {IndexDefinitions} from "./dbIndex";
import {useEffect, useState} from "react";
import {UID} from "../uid";
import {Query} from "./query";

export function useDbQuery<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG, OUT>(db: Database<ENTITY, INDEX>, query: Query<ENTITY, INDEX, ARG, OUT>, arg: ARG): OUT {
    return db.query(query, arg);
}


export function useDbSubscribe<ENTITY, INDEX extends IndexDefinitions<ENTITY>, ARG, OUT extends ENTITY | ENTITY[]>(
    db: Database<ENTITY, INDEX>,
    query: Query<ENTITY, INDEX, ARG, OUT>, arg: ARG
): OUT {
    const [result, setResult] = useState<{ ref: string, result: OUT }>({ // check if "{result: OUT}" is enough to trigger rerender
        ref: UID.generate(),
        result: null as any,
    });

    useEffect(() => {
        const subscriberId = db.subscribeOnQuery(query, arg, r => setResult({ref: UID.generate(), result: r}));
        return () => db.unsubscribe(subscriberId);
    }, []);

    return result.result;
}