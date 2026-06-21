import {useState} from "react";

export function useAction<Args extends unknown[], T>(action: (...args: Args) => T): [(...args: Args) => Promise<Awaited<T>>, boolean] {
    const [loading, setLoading] = useState(false);

    function perform(...args: Args): Promise<Awaited<T>> {
        setLoading(true);

        return Promise.resolve(action(...args))
            .then(result => {
                setLoading(false);
                return result;
            })
            .catch(error => {
                setLoading(false);
                throw error;
            })
    }

    return [perform, loading];
}
