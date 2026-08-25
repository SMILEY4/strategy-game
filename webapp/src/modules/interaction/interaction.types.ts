import type {StoreApi} from "zustand/vanilla";

export type InteractionStatus = "running" | "completed" | "failed" | "cancelled";

export type InteractionCancelReason =
    | { type: "user"; source: "button" | "window-close" | "escape" }
    | { type: "navigation" }
    | { type: "system"; message?: string };

export interface InteractionWindow {
    id: string;
    closePolicy?: "ignore" | "close-window" | "cancel-interaction";
    open: (interactionId: string) => void;
    close?: (interactionId: string) => void;
}

export interface InteractionHost {
    openWindow: (window: InteractionWindow, interactionId: string) => void;
    closeWindow: (window: InteractionWindow, interactionId: string) => void;
}

export interface InteractionSnapshot<State> {
    id: string;
    key: string;
    status: InteractionStatus;
    step: string;
    state: State;
    error: unknown | null;
    windowIds: readonly string[];
}

export interface InteractionDefinition<State, Event> {
    key: string;
    initialStep: string;
    initialState: State;
    steps: Record<string, InteractionStep<State, Event>>;
}

export interface InteractionStep<State, Event> {
    terminal?: boolean;
    enter?: (context: InteractionContext<State, Event>) => void;
    handle: (
        state: State,
        event: Event,
        context: InteractionContext<State, Event>,
    ) => InteractionTransition<State> | void;
    exit?: (context: InteractionContext<State, Event>) => void;
}

export interface InteractionTransition<State> {
    state?: State;
    to?: string;
}

export interface InteractionOperation<T, Event> {
    run: (signal: AbortSignal) => Promise<T>;
    onSuccess: (value: T) => Event;
    onFailure: (error: unknown) => Event;
}

export interface InteractionContext<State, Event> {
    readonly id: string;
    readonly signal: AbortSignal;
    readonly state: State;

    dispatch: (event: Event) => void;
    openWindow: (window: InteractionWindow) => void;
    closeWindow: (windowId: string) => void;
    startOperation: <T>(operation: InteractionOperation<T, Event>) => void;
}

export interface InteractionHandle<State, Event> {
    readonly id: string;
    getSnapshot: () => InteractionSnapshot<State>;
    dispatch: (event: Event) => void;
    cancel: (reason?: InteractionCancelReason) => void;
}

export interface InteractionManager<State = unknown, Event = unknown> {
    start: (definition: InteractionDefinition<State, Event>) => InteractionHandle<State, Event>;
    dispatch: (interactionId: string, event: Event) => boolean;
    getSnapshot: () => InteractionSnapshot<State> | null;
    subscribe: StoreApi<InteractionStoreState<State>>["subscribe"];
    cancelActive: (reason?: InteractionCancelReason) => void;
    store: StoreApi<InteractionStoreState<State>>;
}

export interface InteractionStoreState<State> {
    active: InteractionSnapshot<State> | null;
}
