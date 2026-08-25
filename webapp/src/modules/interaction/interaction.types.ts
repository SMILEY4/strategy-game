import type {StoreApi} from "zustand/vanilla";

/** Lifecycle states exposed to UI and other session consumers. */
export type InteractionStatus = "running" | "completed" | "failed" | "cancelled";

/** Observable state of the interaction currently running in a session. */
export interface InteractionSnapshot<State, Step extends string = string> {
    id: string;
    key: string;
    status: InteractionStatus;
    step: Step;
    state: State;
    error: unknown | null;
}

/** A directed graph of typed steps making up one workflow. */
export interface InteractionDefinition<Step extends string, State, Event> {
    key: string;
    initialStep: Step;
    initialState: State;
    steps: Record<Step, InteractionStep<State, Event, Step>>;
}

/** Infers the graph's step-name union and validates graph transitions. */
export function defineInteraction<const Step extends string, State, Event>(
    definition: InteractionDefinition<Step, State, Event>,
): InteractionDefinition<Step, State, Event> {
    return definition;
}

/** One vertex in an interaction graph. */
export interface InteractionStep<State, Event, Step extends string = string> {
    /** Entering this step completes the interaction. */
    terminal?: boolean;
    /** Open windows or start asynchronous work from this hook. */
    enter?: (context: InteractionContext<State, Event>) => void;
    /** Handle an event and optionally update state or move to another step. */
    handle: (state: State, event: Event) => InteractionTransition<State, Step> | void;
    /** Runs immediately before leaving the step. */
    exit?: (context: InteractionContext<State, Event>) => void;
}

/** Synchronous result of handling one event. */
export interface InteractionTransition<State, Step extends string = string> {
    state?: State;
    to?: Step;
}

/** Services available to lifecycle hooks. */
export interface InteractionContext<State, Event> {
    readonly id: string;
    readonly state: State;
    /** Delivers a later UI or asynchronous event to this interaction. */
    dispatch: (event: Event) => void;
}

/** Stable reference UI code uses to interact with a running workflow. */
export interface InteractionHandle<State, Event, Step extends string = string> {
    readonly id: string;
    getSnapshot: () => InteractionSnapshot<State, Step>;
    dispatch: (event: Event) => void;
    cancel: () => void;
}

/** Session-scoped coordinator enforcing the single-active-interaction rule. */
export interface InteractionManager {
    /** Each started definition keeps its own state, event, and step types. */
    start: <State, Event, Step extends string>(
        definition: InteractionDefinition<Step, State, Event>,
    ) => InteractionHandle<State, Event, Step>;
    /** Prefer a typed handle when possible; this form is for generic event sources. */
    dispatch: (interactionId: string, event: unknown) => boolean;
    getSnapshot: () => InteractionSnapshot<unknown, string> | null;
    subscribe: StoreApi<InteractionStoreState<unknown, string>>["subscribe"];
    cancelActive: () => void;
}

/** Internal store shape used by the manager's subscription API. */
export interface InteractionStoreState<State, Step extends string = string> {
    active: InteractionSnapshot<State, Step> | null;
}
