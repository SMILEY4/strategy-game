import type {
    InteractionBaseEvent,
    InteractionDefinition,
    InteractionStateDefinition,
    InteractionTransitionDefinition,
} from "@modules/interaction/interaction.definition.ts";

export interface InteractionMachine<
    TStateName extends string,
    TEvent extends InteractionBaseEvent,
    TContext,
> {
    send: (event: TEvent) => void,
    getContext: () => TContext,
    getCurrentState: () => TStateName
    stop: () => void
}

export interface InteractionMachineState<TContext, TStateName extends string> {
    id: string,
    context: TContext,
    stateName: TStateName
}

export function createInteractionMachine<
    TStateName extends string,
    TEvent extends InteractionBaseEvent,
    TContext,
    TInput = undefined,
>(
    definition: InteractionDefinition<TInput, TContext, TEvent, TStateName>,
    input: TInput,
    setMachineState: (state: InteractionMachineState<TContext, TStateName> | null) => void,
    getMachineState: () => InteractionMachineState<TContext, TStateName> | null,
): InteractionMachine<TStateName, TEvent, TContext> {

    const id = crypto.randomUUID();

    function loadState(): InteractionMachineState<TContext, TStateName> {
        const state = getMachineState();
        if(!state) {
            throw new Error("Could not load state: missing state");
        }
        if (state.id !== id) {
            throw new Error("Could not load state: state was modified by another interaction");
        }
        return state;
    }

    function initialize() {
        const interactionState = {
            id: id,
            context: definition.initialContext(input),
            stateName: definition.initialState(input),
        };

        const activeStateDefinition = definition.states[interactionState.stateName];
        if (activeStateDefinition == null) {
            throw new Error(`Could not initialize interaction: unknown state '${interactionState.stateName}'`);
        }

        let context = interactionState.context;
        if (activeStateDefinition.onEnter) {
            context = {
                ...context,
                ...activeStateDefinition.onEnter({context: interactionState.context, event: {type: "__INIT__"}}),
            };
        }

        setMachineState({
            ...interactionState,
            context: context,
        });
    }


    function send(event: TEvent): void {
        const interactionState = loadState();

        const activeStateDefinition = definition.states[interactionState.stateName];
        if (activeStateDefinition == null) {
            throw new Error(`Could not send event: unknown state '${interactionState.stateName}'`);
        }

        const transitionDefinition = getTransition(activeStateDefinition, event.type);
        if (transitionDefinition == null || !allowTransition(activeStateDefinition, transitionDefinition, event, interactionState.context)) {
            return;
        }

        const targetStateDefinition = definition.states[transitionDefinition.target];
        if (targetStateDefinition == null) {
            throw new Error(`Could not transition interaction: unknown state '${transitionDefinition.target}'`);
        }

        const runStateHooks = shouldExecuteStateHooks(interactionState.stateName, transitionDefinition);

        let context = interactionState.context;
        if (activeStateDefinition.onExit && runStateHooks) {
            context = {
                ...context,
                ...activeStateDefinition.onExit({context: context, event: event}),
            };
        }
        if (transitionDefinition.action) {
            context = {
                ...context,
                ...transitionDefinition.action({context: context, event: event}),
            };
        }
        if (targetStateDefinition.onEnter && runStateHooks) {
            context = {
                ...context,
                ...targetStateDefinition.onEnter({context: context, event: event}),
            };
        }

        setMachineState({
            ...interactionState,
            context: context,
            stateName: transitionDefinition.target,
        });

    }

    function allowTransition(
        state: InteractionStateDefinition<TContext, TEvent, TStateName>,
        transition: InteractionTransitionDefinition<TContext, TEvent, TStateName>,
        event: TEvent,
        context: TContext,
    ) {
        return state.terminal !== true && (transition.guard == null || transition.guard({context: context, event: event}));
    }

    function shouldExecuteStateHooks(prevState: TStateName, transition: InteractionTransitionDefinition<TContext, TEvent, TStateName>) {
        return prevState !== transition.target || transition.reenter === true;
    }

    function getTransition(
        state: InteractionStateDefinition<TContext, TEvent, TStateName>,
        eventType: string,
    ): InteractionTransitionDefinition<TContext, TEvent, TStateName> | undefined {
        const untypedState = state as unknown as Record<string, unknown>;
        const untypedTransition = untypedState[eventType];
        return untypedTransition as InteractionTransitionDefinition<TContext, TEvent, TStateName> | undefined;
    }

    function stop() {
        setMachineState(null)
    }

    initialize();

    return {
        send: send,
        stop: stop,
        getContext: () => loadState().context,
        getCurrentState: () => loadState().stateName,
    };
}
