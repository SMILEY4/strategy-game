export interface InteractionDefinition<State, Event, Step extends string> {
    initialState: State,
    initialStep: Step,
    steps: Record<Step, InteractionStep<State, Event, Step>>,
}

export interface InteractionStep<State, Event, Step extends string> {
    terminal?: boolean,
    onEnter?: (state: State, event: Event) => State;
    onHandle?: (state: State, event: Event) => InteractionTransition<State, Step> | undefined
    onExit?: (state: State, event: Event) => State;
}

export interface InteractionTransition<State, Step extends string> {
    to: Step,
    state?: State
}