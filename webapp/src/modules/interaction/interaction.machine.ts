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
    send: (event: TEvent) => Promise<void>,
    stop: () => void
    getContext: () => TContext,
    getCurrentState: () => TStateName
    getDefinition: () => InteractionDefinition<any, TContext, TEvent, TStateName>
}

export interface InteractionMachineState<TContext, TStateName extends string> {
    id: string,
    definition: InteractionDefinition<any, TContext, any, TStateName>
    context: TContext,
    stateName: TStateName
}

export async function createInteractionMachine<
    TStateName extends string,
    TEvent extends InteractionBaseEvent,
    TContext,
    TInput = undefined,
>(
    definition: InteractionDefinition<TInput, TContext, TEvent, TStateName>,
    input: TInput,
    setMachineState: (state: InteractionMachineState<TContext, TStateName> | null) => void,
    getMachineState: () => InteractionMachineState<TContext, TStateName> | null,
): Promise<InteractionMachine<TStateName, TEvent, TContext>> {

    const id = crypto.randomUUID();

    function debug(message: string, details?: Record<string, unknown>) {
        console.debug(`[InteractionMachine:${id}] ${message}`, details);
    }

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

    async function initialize() {
        const interactionState = {
            id: id,
            definition: definition,
            context: definition.initialContext(input),
            stateName: definition.initialState(input),
        };
        debug("Initializing", {state: interactionState.stateName});

        const activeStateDefinition = definition.states[interactionState.stateName];
        if (activeStateDefinition == null) {
            throw new Error(`Could not initialize interaction: unknown state '${interactionState.stateName}'`);
        }

        let context = interactionState.context;
        let event: TEvent | undefined;
        if (activeStateDefinition.onEnter) {
            const resultEnter = await activeStateDefinition.onEnter({context: interactionState.context, event: {type: "__INIT__"}});
            ({context, event} = resolveEntryResult(context, resultEnter));
            debug("initial enter hook finished", {event: event?.type});
        }

        setMachineState({
            ...interactionState,
            context: context,
        });

        if (event) {
            debug("Dispatching event returned by initial enter hook", {event: event.type});
            await send(event);
        }
    }


    async function send(event: TEvent): Promise<void> {
        const interactionState = loadState();
        debug("Event received", {state: interactionState.stateName, event: event.type});

        const activeStateDefinition = definition.states[interactionState.stateName];
        if (activeStateDefinition == null) {
            throw new Error(`Could not send event: unknown state '${interactionState.stateName}'`);
        }

        const transitionDefinition = getTransition(activeStateDefinition, event.type);
        if (transitionDefinition == null) {
            debug("Event ignored: no transition", {state: interactionState.stateName, event: event.type});
            return;
        }
        if (!allowTransition(activeStateDefinition, transitionDefinition, event, interactionState.context)) {
            debug("Event ignored: transition guard rejected it", {state: interactionState.stateName, event: event.type});
            return;
        }

        const stateNameFrom = interactionState.stateName
        const stateNameTo = transitionDefinition.target

        const targetStateDefinition = definition.states[transitionDefinition.target];
        if (targetStateDefinition == null) {
            throw new Error(`Could not transition interaction: unknown state '${transitionDefinition.target}'`);
        }

        const runStateHooks = shouldExecuteStateHooks(interactionState.stateName, transitionDefinition);

        let context = interactionState.context;
        let eventFromEnter: TEvent | undefined;
        if (activeStateDefinition.onExit && runStateHooks) {
            const resultExit = await activeStateDefinition.onExit({context: context, event: event})
            debug("Exit hook finished", { state: stateNameFrom, event: event.type});
            context = {
                ...context,
                ...resultExit,
            };
        }
        if (transitionDefinition.action) {
            const resultAction = await transitionDefinition.action({context: context, event: event})
            debug("Transition Action finished", { from: stateNameFrom, to: stateNameTo, event: event.type});
            context = {
                ...context,
                ...resultAction,
            };
        }
        if (targetStateDefinition.onEnter && runStateHooks) {
            const resultEnter = await targetStateDefinition.onEnter({context: context, event: event});
            ({context, event: eventFromEnter} = resolveEntryResult(context, resultEnter));
            debug("Enter hook finished", { state: stateNameTo, event: event.type});
        }

        setMachineState({
            ...interactionState,
            context: context,
            stateName: transitionDefinition.target,
        });

        if (eventFromEnter) {
            debug("Dispatching event returned by enter hook", {event: eventFromEnter.type});
            await send(eventFromEnter);
        }
    }

    function resolveEntryResult(
        context: TContext,
        result: Partial<TContext> | {context?: Partial<TContext>; event?: TEvent} | void,
    ): {context: TContext; event?: TEvent} {
        if (result != null && typeof result === "object" && ("context" in result || "event" in result)) {
            return {
                context: {...context, ...result.context},
                event: result.event,
            };
        }
        return {
            context: {...context, ...(result ?? {})},
        };
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
        debug("Stopped", {state: getMachineState()?.stateName});
        setMachineState(null)
    }

    await initialize();

    return {
        send: send,
        stop: stop,
        getContext: () => loadState().context,
        getCurrentState: () => loadState().stateName,
        getDefinition: () => definition
    };
}
