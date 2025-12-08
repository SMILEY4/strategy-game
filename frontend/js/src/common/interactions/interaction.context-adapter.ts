import {SetState} from "../zustandUtils";
import create from "zustand";

/**
 * Provider for the interaction context
 */
export interface InteractionContextAdapter {
    get: () => any | null;
    set: (ctx: any) => void,
    update: (updater: (ctx: any) => any) => any;
    clear: () => void;
}

/**
 * Provider for the interaction context based on a Zustand store
 */
export const ZustandInteractionContextAdapter: InteractionContextAdapter = {
    get: () => {
        return useDirectInteractionContext.getState().context;
    },
    set: (ctx: any) => {
        useDirectInteractionContext.getState().set(ctx);
    },
    update: (updater: (ctx: any) => any) => {
        const current = useDirectInteractionContext.getState().context;
        const next = updater(current);
        useDirectInteractionContext.getState().set(next);
    },
    clear: () => {
        useDirectInteractionContext.getState().set(null);
    },
};

/**
 * Hook to access the current interaction context (read only).
 */
export function useInteractionContext(): any | null {
    return useDirectInteractionContext().context;
}

//==== STORE ============================

interface StateValues {
    context: any | null,
}

const initialStateValues: StateValues = {
    context: null,
};

interface StateActions {
    set: (context: any | null) => void;
}

function stateActions(set: SetState<State>): StateActions {
    return {
        set: (context: any | null) => set(() => ({
            context: context,
        })),
    };
}

interface State extends StateValues, StateActions {
}

const useDirectInteractionContext = create<State>()((set) => ({
    ...initialStateValues,
    ...stateActions(set),
}));