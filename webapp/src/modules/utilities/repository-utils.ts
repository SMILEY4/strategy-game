import {hashKey, QueryClient, type QueryKey} from "@tanstack/query-core";

/** Result of subscribing to reactive data, providing the initial value and an unsubscribe function. */
export type ReactiveResult<TData> = { initial: ReactiveStateletResult<TData>, unsubscribe: () => void };

/** Union type representing the status of a reactive data statelet. */
export type ReactiveStateletResult<TData> =
    | { status: "init" }
    | { status: "available", data: TData }
    | { status: "updating", data: TData }
    | { status: "loading" }
    | { status: "error" }

export type ReactiveStateletSubscription<TData> = ((state: ReactiveStateletResult<TData>) => void) | null


/** Subscribe to query cache changes for a given query key, providing reactive data updates. */
export function getReactiveData<TData>(options: {
    queryClient: QueryClient,
    queryKey: QueryKey,
    fetchFn: () => unknown,
    subscription: ReactiveStateletSubscription<TData>
}): ({
    initial: ReactiveStateletResult<TData>,
    unsubscribe: () => void,
}) {

    const {queryClient, queryKey, fetchFn, subscription} = options;

    let unsubscribeFn: () => void = () => undefined;
    if (subscription) {

        const queryHash = hashKey(queryKey);
        unsubscribeFn = queryClient.getQueryCache().subscribe((event) => {
            if (event.type === "updated" && event.query.queryHash === queryHash) {
                const data = event.query.state.data as TData | undefined;
                if (data) {
                    subscription({status: "available", data: data});
                }
            }
        });

        void fetchFn();

    }

    const cached = queryClient.getQueryData<TData>(queryKey);
    const initial: ReactiveStateletResult<TData> = cached
        ? {status: "available", data: cached}
        : {status: "loading"};

    return {
        initial: initial,
        unsubscribe: unsubscribeFn,
    };
}