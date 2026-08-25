import type {InteractionDefinition} from "@modules/interaction/interaction.definition.ts";
import type {InteractionRuntime, InteractionState} from "@modules/interaction/interaction.state.ts";

export interface InteractionManager {
    start: <State, Event, Step extends string>(definition: InteractionDefinition<State, Event, Step>, initialEvent: Event) => void;
    dispatch: <Event>(event: Event) => void;
    stop: () => void;
}

interface Dependencies {
    getState: () => InteractionState<any, any, string>
    setState: (state: InteractionState<any, any, string>) => void,
}

export const interactionManager = ({setState, getState}: Dependencies): InteractionManager => {

    return {
        start: <State, Event, Step extends string>(definition: InteractionDefinition<State, Event, Step>, initialEvent: Event) => {
            const state = getState();
            if (state.active) {
                throw new Error("Can not start interaction - another one is already active.");
            }

            const initialStep = definition.steps[definition.initialStep];
            if (!initialStep) {
                throw new Error(`Can not start interaction - unknown initial step: ${definition.initialStep}`);
            }

            const runtime: InteractionRuntime<State, Event, Step> = {
                definition,
                state: definition.initialState,
                step: initialStep,
            };

            if (initialStep.onEnter) {
                runtime.state = initialStep.onEnter(runtime.state, initialEvent);
            }

            if (initialStep.terminal) {
                initialStep.onExit?.(runtime.state, initialEvent);
                setState({...state, active: null});
                return;
            }

            setState({...state, active: runtime});
        },

        dispatch: <Event>(event: Event) => {
            const state = getState();
            if (!state.active) {
                throw new Error("Can not dispatch interaction event - no interaction active.");
            }

            const runtime = state.active as InteractionRuntime<any, Event, string>;
            const activeStep = runtime.step;

            const transition = activeStep.onHandle?.(runtime.state, event);
            if (!transition) {
                return;
            }

            const nextStep = runtime.definition.steps[transition.to];
            if (!nextStep) {
                throw new Error(`Can not dispatch interaction event - unknown step: ${transition.to}`);
            }

            let nextState = Object.hasOwn(transition, "state") ? transition.state : runtime.state;
            if (activeStep !== nextStep) {
                if (activeStep.onExit) {
                    nextState = activeStep.onExit(nextState, event);
                }
                if (nextStep.onEnter) {
                    nextState = nextStep.onEnter(nextState, event);
                }
            }

            if (nextStep.terminal) {
                nextStep.onExit?.(nextState, event);
                setState({...state, active: null});
            } else {
                const nextRuntime: InteractionRuntime<any, Event, string> = {
                    ...runtime,
                    state: nextState,
                    step: nextStep,
                };
                setState({...state, active: nextRuntime});
            }

        },

        stop: (): void => {
            const state = getState();
            if (!state.active) {
                return;
            }
            setState({
                ...state,
                active: null,
            });
        },
    };
};
