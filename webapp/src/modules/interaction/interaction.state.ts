import type {InteractionDefinition, InteractionStep} from "@modules/interaction/interaction.definition.ts";

export interface InteractionState<State, Event, Step extends string> {
    active: InteractionRuntime<State, Event, Step> | null;
}

export interface InteractionRuntime<State, Event, Step extends string> {
    definition: InteractionDefinition<State, Event, Step>;
    state: State,
    step: InteractionStep<State, Event, Step>
}
