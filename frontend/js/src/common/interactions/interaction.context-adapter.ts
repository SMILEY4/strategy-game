import {SetState} from "../zustandUtils";
import create from "zustand";

/**
 * Provider for the interaction context
 */
export interface InteractionContextAdapter {
    set: (id: string | null, ctx: any) => void;
    clear: () => void;
    getContext: () => any | null;
    setContext: (ctx: any) => void,
    updateContext: (updater: (ctx: any) => any) => any;
}

/**
 * Provider for the interaction context based on a Zustand store
 */
export const ZustandInteractionContextAdapter: InteractionContextAdapter = {
    set: (id: string | null, context: any | null) => {
        useDirectInteractionContext.getState().set(prev => ({
            ...prev,
            activeInteraction: id,
            context: context,
        }));
    },
    clear: () => {
        useDirectInteractionContext.getState().set(prev => ({
            activeInteraction: null,
            context: null,
        }));
    },
    getContext: () => {
        return useDirectInteractionContext.getState().context;
    },
    setContext: (ctx: any) => {
        useDirectInteractionContext.getState().set(prev => ({
            ...prev,
            context: ctx,
        }));
    },
    updateContext: (updater: (ctx: any) => any) => {
        useDirectInteractionContext.getState().set(prev => ({
            ...prev,
            context: updater(prev.context),
        }));
    },
};

/**
 * Hook to access the current interaction context (read only).
 */
export function useInteractionContext(): any | null {
    return useDirectInteractionContext().context;
}

/**
 * Hook to access the current interaction id (read only).
 */
export function useActiveInteractionId(): any | null {
    return useDirectInteractionContext().activeInteraction;
}

//==== STORE ============================

interface StateValues {
    activeInteraction: string | null;
    context: any | null,
}

const initialStateValues: StateValues = {
    activeInteraction: null,
    context: null,
};

interface StateActions {
    set: (update: (prev: StateValues) => StateValues) => void;
}

function stateActions(set: SetState<State>): StateActions {
    return {
        set: (update: (prev: StateValues) => StateValues) => set(state => update(state)),
    };
}

interface State extends StateValues, StateActions {
}

const useDirectInteractionContext = create<State>()((set) => ({
    ...initialStateValues,
    ...stateActions(set),
}));