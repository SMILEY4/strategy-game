export interface InteractionDefinition<State, Event, Step extends string> {
    initialState: State,
    initialStep: Step,
    steps: Record<Step, InteractionStep<State, Event, Step>>,
}

export interface InteractionStep<State, Event, Step extends string> {
    terminal?: boolean,
    onEnter?: (state: State, event: Event) => State;
    onHandle?: (state: State, event: Event) => InteractionTransition<State, Step> | undefined;
    onExit?: (state: State, event: Event) => State;
}

export interface InteractionTransition<State, Step extends string> {
    to: Step,
    state?: State
}

export const createInteractionDefinition = <State, Event>() =>
    <const Steps extends Record<string, unknown>>(definition: {
        initialState: State,
        initialStep: NoInfer<keyof Steps & string>,
        steps: {[Step in keyof Steps]: InteractionStep<State, Event, keyof Steps & string>},
    }): InteractionDefinition<State, Event, keyof Steps & string> => definition;
