import type {ReactiveResult, ReactiveStateletResult, ReactiveStateletSubscription} from "@modules/utilities/repository-utils.ts";
import type {StoreApi} from "zustand/vanilla";

/** Subscribe to a Zustand store slice, returning reactive result with the initial value. */
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