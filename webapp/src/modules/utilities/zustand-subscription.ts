import type {ReactiveResult, ReactiveStateletResult, ReactiveStateletSubscription} from "@modules/utilities/repository-utils.ts";
import type {StoreApi} from "zustand/vanilla";

export function subscribeToZustand<TStore, TData>(
    store: StoreApi<TStore>,
    subscription: ReactiveStateletSubscription<TData>,
    selector: (store: TStore) => TData,
): ReactiveResult<TData> {

    const initial: ReactiveStateletResult<TData> = {
        status: "available",
        data: selector(store.getState()),
    };

    if (subscription) {

        const unsubscribe = store.subscribe(state => {
            subscription({status: "available", data: selector(state)});
        });

        subscription(initial);

        return {
            initial: initial,
            unsubscribe: unsubscribe,
        };

    } else {
        return {
            initial: initial,
            unsubscribe: () => undefined,
        };
    }
}