import type {InteractionDefinition} from "@modules/interaction/interaction.definition.ts";
import type {InteractionRuntime, InteractionState} from "@modules/interaction/interaction.state.ts";

export interface InteractionManager {
    start: <State, Event, Step extends string>(definition: InteractionDefinition<State, Event, Step>, initialEvent: Event) => void;
    dispatch: <Event>(event: Event) => void;
}

interface Dependencies {
    setState: (state: InteractionState<any, any, string>) => void,
    getState: () => InteractionState<any, any, string>
}

export const interactionManager = ({setState, getState}: Dependencies): InteractionManager => {

    return {
        start: <State, Event, Step extends string>(definition: InteractionDefinition<State, Event, Step>, initialEvent: Event) => {
            const state = getState();
            if (state.active) {
                throw new Error("Can not start interaction - another one is already active.");
            }

            const runtime: InteractionRuntime<State, Event, Step> = {
                definition: definition,
                state: {...definition.initialState},
                step: definition.steps[definition.initialStep],
            };

            const modifiedState = runtime.step.onEnter?.(runtime.state, initialEvent);
            if (modifiedState) {
                runtime.state = modifiedState;
            }

            setState({
                ...state,
                active: runtime,
            });
        },

        dispatch: <State, Event, Step extends string>(event: Event) => {
            const state = getState();
            if (!state.active) {
                throw new Error("Can not dispatch interaction event - no interaction active.");
            }

            const runtime: InteractionRuntime<State, Event, Step> = state.active as InteractionRuntime<State, Event, Step>;

            const transition = state.active.step.onHandle?.(runtime.state, event);

            if (transition && transition.state) {
                runtime.state = transition.state;
            }
            if (transition && transition.to) {
                const stateExit = runtime.step.onExit?.(runtime.state, event);
                if (stateExit) {
                    runtime.state = stateExit;
                }
                runtime.step = runtime.definition.steps[transition.to as Step];
                const stateEnter = runtime.step.onEnter?.(runtime.state, event);
                if (stateEnter) {
                    runtime.state = stateEnter;
                }
            }

            if (transition) {
                setState({
                    ...state,
                    active: runtime,
                });
            }

        },
    };
};