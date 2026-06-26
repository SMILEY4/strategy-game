import {hashKey, QueryClient, type QueryKey} from "@tanstack/query-core";

export type ReactiveResult<TData> = { initial: ReactiveStateletResult<TData>, unsubscribe: () => void };

export type ReactiveStateletResult<TData> =
    | { status: "init" }
    | { status: "available", data: TData }
    | { status: "updating", data: TData }
    | { status: "loading" }
    | { status: "error" }

export type ReactiveStateletSubscription<TData> = ((state: ReactiveStateletResult<TData>) => void) | null


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