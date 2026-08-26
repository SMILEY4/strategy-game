import type {
    InteractionBaseEvent,
    InteractionDefinition,
    InteractionStateDefinition,
    InteractionTransitionDefinition,
} from "@modules/interaction/interaction.definition.ts";

interface InteractionState<TContext, TStateName extends string> {
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
    setState: (state: InteractionState<TContext, TStateName>) => void,
    getState: () => InteractionState<TContext, TStateName>,
) {
    const id = crypto.randomUUID();

    function loadState(): InteractionState<TContext, TStateName> {
        const state = getState();
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

        let context = interactionState.context;
        if (activeStateDefinition.onEnter) {
            context = {
                ...context,
                ...activeStateDefinition.onEnter({context: interactionState.context, event: {type: "__INIT__"}}),
            };
        }

        setState({
            ...interactionState,
            context: context,
        });
    }


    function send(event: TEvent): void {
        const interactionState = loadState();

        const activeStateDefinition = definition.states[interactionState.stateName];

        const transitionDefinition = getTransition(activeStateDefinition, event.type);
        if (!allowTransition(activeStateDefinition, transitionDefinition, event, interactionState.context)) {
            return;
        }

        const targetStateDefinition = definition.states[transitionDefinition.target];

        const runStateHooks = shouldExecuteStateHooks(interactionState.stateName, transitionDefinition);

        let context = interactionState.context;
        if (activeStateDefinition.onExit && runStateHooks) {
            context = {
                ...context,
                ...activeStateDefinition.onExit({context: interactionState.context, event: event}),
            };
        }
        if (transitionDefinition.action) {
            context = {
                ...context,
                ...transitionDefinition.action({context: interactionState.context, event: event}),
            };
        }
        if (targetStateDefinition.onEnter && runStateHooks) {
            context = {
                ...context,
                ...targetStateDefinition.onEnter({context: interactionState.context, event: event}),
            };
        }

        setState({
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
        return state.terminal !== false && transition.guard?.({context: context, event: event as TEvent});
    }

    function shouldExecuteStateHooks(prevState: TStateName, transition: InteractionTransitionDefinition<TContext, TEvent, TStateName>) {
        return prevState === transition.target && transition.reenter;
    }

    function getTransition(state: InteractionStateDefinition<TContext, TEvent, TStateName>, eventType: string): InteractionTransitionDefinition<TContext, TEvent, TStateName> {
        const untypedState = state as unknown as Record<string, unknown>;
        const untypedTransition = untypedState[eventType];
        return untypedTransition as InteractionTransitionDefinition<TContext, TEvent, TStateName>;
    }

    initialize();

    return {
        send: send,
    };
}
