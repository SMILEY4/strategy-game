import {createStore} from "zustand/vanilla";
import type {ReactiveResult, ReactiveStateletSubscription} from "@modules/utilities/repository-utils.ts";
import {subscribeToZustand} from "@modules/utilities/zustand-subscription.ts";

export interface GameRepository {
    setState: (state: "loading" | "playing" | "error") => void;
    getStateReactive: (subscription: ReactiveStateletSubscription<"loading" | "playing" | "error">) => ReactiveResult<"loading" | "playing" | "error">;
    getState: () => "loading" | "playing" | "error"
}

interface GameRepositoryState {
    state: "loading" | "playing" | "error";
}

export const gameRepository = (): GameRepository => {

    const store = createStore<GameRepositoryState>(() => ({
        state: "loading",
    }));

    return {

        setState: (state: "loading" | "playing" | "error") => {
            store.setState({
                state: state,
            });
        },

        getStateReactive: (subscription: ReactiveStateletSubscription<"loading" | "playing" | "error">) => {
            return subscribeToZustand<GameRepositoryState, "loading" | "playing" | "error">(store, subscription, store => store.state);
        },

        getState: () => {
            return store.getState().state
        },
    };

};