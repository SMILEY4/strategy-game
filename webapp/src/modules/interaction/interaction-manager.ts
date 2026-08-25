import {createStore} from "zustand/vanilla";
import {InteractionBusyError, InteractionDefinitionError} from "./interaction-errors.ts";
import type {
    InteractionContext,
    InteractionDefinition,
    InteractionHandle,
    InteractionManager,
    InteractionSnapshot,
    InteractionStep,
    InteractionStoreState,
} from "./interaction.types.ts";

export function createInteractionManager<State = unknown, Event = unknown, Step extends string = string>(): InteractionManager<State, Event, Step> {
    const store = createStore<InteractionStoreState<State, Step>>(() => ({active: null}));
    let active: RuntimeInteraction<State, Event, Step> | null = null;

    function publish(runtime: RuntimeInteraction<State, Event, Step>): void {
        store.setState({active: runtime.snapshot()});
    }

    function clear(runtime: RuntimeInteraction<State, Event, Step>): void {
        if (active?.id === runtime.id) {
            active = null;
            store.setState({active: null});
        }
    }

    function start(definition: InteractionDefinition<Step, State, Event>): InteractionHandle<State, Event, Step> {
        // Reserve the session slot before entering the first step.
        if (active) {
            throw new InteractionBusyError();
        }

        const initialStep = definition.steps[definition.initialStep];
        if (!initialStep) {
            throw new InteractionDefinitionError(`Missing initial step: ${definition.initialStep}`);
        }

        const runtime = new RuntimeInteraction(
            definition,
            crypto.randomUUID(),
            initialStep,
            publish,
            clear,
        );
        active = runtime;
        publish(runtime);
        runtime.enter();
        return runtime;
    }

    return {
        start,
        dispatch: (interactionId, event) => active?.id === interactionId ? active.dispatch(event) : false,
        getSnapshot: () => store.getState().active,
        subscribe: store.subscribe,
        cancelActive: () => active?.cancel(),
        store,
    };
}

class RuntimeInteraction<State, Event, Step extends string> implements InteractionHandle<State, Event, Step> {
    readonly id: string;
    private readonly definition: InteractionDefinition<Step, State, Event>;
    private readonly publishSnapshot: (runtime: RuntimeInteraction<State, Event, Step>) => void;
    private readonly clearSnapshot: (runtime: RuntimeInteraction<State, Event, Step>) => void;
    private status: "running" | "completed" | "failed" | "cancelled" = "running";
    private error: unknown | null = null;
    private state: State;
    private stepName: Step;
    private step: InteractionStep<State, Event, Step>;

    constructor(
        definition: InteractionDefinition<Step, State, Event>,
        id: string,
        step: InteractionStep<State, Event, Step>,
        publishSnapshot: (runtime: RuntimeInteraction<State, Event, Step>) => void,
        clearSnapshot: (runtime: RuntimeInteraction<State, Event, Step>) => void,
    ) {
        this.definition = definition;
        this.id = id;
        this.step = step;
        this.stepName = definition.initialStep;
        this.state = definition.initialState;
        this.publishSnapshot = publishSnapshot;
        this.clearSnapshot = clearSnapshot;
    }

    getSnapshot(): InteractionSnapshot<State, Step> {
        return this.snapshot();
    }

    dispatch(event: Event): boolean {
        if (this.status !== "running") {
            return false;
        }

        try {
            // Events are synchronous; entering the next step performs its work.
            const transition = this.step.handle(this.state, event);
            if (!transition) {
                return true;
            }
            if (transition.state !== undefined) {
                this.state = transition.state;
            }
            if (transition.to !== undefined) {
                this.transitionTo(transition.to);
            } else {
                this.publishSnapshot(this);
            }
            return true;
        } catch (error) {
            this.fail(error);
            return true;
        }
    }

    cancel(): void {
        if (this.status !== "running") {
            return;
        }
        this.status = "cancelled";
        this.publishSnapshot(this);
        this.clearSnapshot(this);
    }

    enter(): void {
        try {
            this.step.enter?.(this.context());
            if (this.status === "running") {
                this.publishSnapshot(this);
            }
            if (this.status === "running" && this.step.terminal) {
                this.complete();
            }
        } catch (error) {
            this.fail(error);
        }
    }

    snapshot(): InteractionSnapshot<State, Step> {
        return {
            id: this.id,
            key: this.definition.key,
            status: this.status,
            step: this.stepName,
            state: this.state,
            error: this.error,
        };
    }

    private transitionTo(stepName: string): void {
        if (!(stepName in this.definition.steps)) {
            throw new InteractionDefinitionError(`Missing step: ${stepName}`);
        }
        const nextStepName = stepName as Step;
        this.step.exit?.(this.context());
        this.step = this.definition.steps[nextStepName];
        this.stepName = nextStepName;
        this.publishSnapshot(this);
        this.step.enter?.(this.context());
        if (this.status === "running") {
            this.publishSnapshot(this);
        }
        if (this.status === "running" && this.step.terminal) {
            this.complete();
        }
    }

    private context(): InteractionContext<State, Event> {
        return {
            id: this.id,
            state: this.state,
            dispatch: event => this.dispatch(event),
        };
    }

    private fail(error: unknown): void {
        if (this.status !== "running") {
            return;
        }
        this.status = "failed";
        this.error = error;
        this.publishSnapshot(this);
        this.clearSnapshot(this);
    }

    private complete(): void {
        if (this.status !== "running") {
            return;
        }
        this.status = "completed";
        this.publishSnapshot(this);
        this.clearSnapshot(this);
    }
}
