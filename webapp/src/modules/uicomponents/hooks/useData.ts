import type {ReactiveResult, ReactiveStateletResult, ReactiveStateletSubscription} from "@modules/utilities/repository-utils.ts";
import {useCallback, useEffect, useState} from "react";

export interface UseDataOptions<TData> {
    fn: (subscription: ReactiveStateletSubscription<TData>) => ReactiveResult<TData>;
}

/**
 * Use when the options.fn function can change, e.g. with different parameters.
 * Caller or useData need to make sure that options.fn does not change during re-renders.
 */
export function useData<TData>(options: UseDataOptions<TData>): ReactiveStateletResult<TData> {

    const { initial, unsubscribe } = options.fn(null)
    unsubscribe()

    const [state, setState] = useState<ReactiveStateletResult<TData>>(initial);

    useEffect(() => {
        return options.fn(next => setState(next)).unsubscribe;
    }, [options.fn]);

    return state;
}

/**
 * Use when the option.fn never changes, e.g. always the same parameters.
 */
export function useDataStatic<TData>(options: UseDataOptions<TData>) {
    const stableFn = useCallback(options.fn, []);
    return useData<TData>({
        ...options,
        fn: stableFn,
    });
}