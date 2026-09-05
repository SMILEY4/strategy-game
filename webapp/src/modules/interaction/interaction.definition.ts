/**
 * the base for an interaction event
 */
export type InteractionBaseEvent = { type: string };

/**
 * the event triggered when initializing the first state
 */
export type InteractionInitEvent = { type: "__INIT__" };

/**
 * The complete configuration for an interaction
 */
export interface InteractionDefinition<TInput, TContext, TEvent extends InteractionBaseEvent, TStateName extends string> {
    initialContext: (input: TInput) => TContext;
    initialState: (input: TInput) => TStateName;
    states: {
        [K in TStateName]: InteractionStateDefinition<TContext, TEvent, TStateName>;
    };
}

/**
 * The configuration for a single state of an interaction
 */
export type InteractionStateDefinition<TContext, TEvent extends InteractionBaseEvent, TStateName extends string> =
    {
        /** whether this state is an end state */
        terminal?: boolean;
        /** triggered when transitioning to this state with the associated event. Return a partial context, or a partial context and event to dispatch.  */
        onEnter?: EntryFn<TContext, TEvent, TEvent | InteractionInitEvent>;
        /** triggered when transitioning away from this state with the associated event. Return a partial context to update the interaction context.  */
        onExit?: ExitFn<TContext, TEvent>;
    } &
    {
        [E in TEvent as E["type"]]?: InteractionTransitionDefinition<TContext, Extract<TEvent, { type: E["type"] }>, TStateName>;
    };

/**
 * The configuration for a transition from a specific state to a given target state
 */
export type InteractionTransitionDefinition<TContext, TEvent extends InteractionBaseEvent, TStateName extends string> =
    {
        /** The target state to transition to */
        target: TStateName;
        /** Whether to trigger the exit and enter functions of the state when this is a self-transition */
        reenter?: boolean,
        /** A condition checking whether the transition should be executed. Return true to allow the transition */
        guard?: GuardFn<TContext, TEvent>;
        /** Triggered when this transition is executed with the associated event. Return a partial context to update the interaction context. */
        action?: ActionFn<TContext, TEvent>;
    };

/**
 * The type for the transition guard function.
 */
type GuardFn<TContext, TEvent extends InteractionBaseEvent> = (args: ActionParameter<TContext, TEvent>) => boolean | Promise<boolean>;

/**
 * The type for the transition action function
 */
type ActionFn<TContext, TEvent extends InteractionBaseEvent> = (args: ActionParameter<TContext, TEvent>) => Partial<TContext> | Promise<Partial<TContext>> | void | Promise<void>;

/**
 * The type for the state entry hook function
 */
type EntryResult<TContext, TEvent extends InteractionBaseEvent> =
    | Partial<TContext>
    | {context?: Partial<TContext>; event?: TEvent}
    | void;

type EntryFn<
    TContext,
    TEvent extends InteractionBaseEvent,
    TTriggerEvent extends InteractionBaseEvent = TEvent,
> = (args: ActionParameter<TContext, TTriggerEvent>) => EntryResult<TContext, TEvent> | Promise<EntryResult<TContext, TEvent>>;

/**
 * The type for the state exit hook function
 */
type ExitFn<TContext, TEvent extends InteractionBaseEvent> = (args: ActionParameter<TContext, TEvent>) => Partial<TContext> | Promise<Partial<TContext>> | void | Promise<void>;


/**
 * The parameters/data provided to state and transition actions
 */
interface ActionParameter<TContext, TEvent extends InteractionBaseEvent> {
    context: TContext;
    event: TEvent;
}

/**
 * The builder for a typesafe interaction config.
 * @param config the config to build
 */
export function createInteractionDefinition<
    const TStateName extends string,
    TEvent extends InteractionBaseEvent,
    TContext,
    TInput = undefined,
>(
    config: InteractionDefinition<TInput, TContext, TEvent, TStateName>,
): InteractionDefinition<TInput, TContext, TEvent, TStateName> {
    return config;
}
