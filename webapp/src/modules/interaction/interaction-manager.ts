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

interface ActiveRuntime {
    readonly id: string;
    snapshot: () => InteractionSnapshot<unknown, string>;
    dispatch: (event: unknown) => boolean;
    cancel: () => void;
}

/** Creates the session-scoped coordinator for independent interaction types. */
export function createInteractionManager(): InteractionManager {
    const store = createStore<InteractionStoreState<unknown, string>>(() => ({active: null}));
    let active: ActiveRuntime | null = null;

    function publish(runtime: ActiveRuntime): void {
        store.setState({active: runtime.snapshot()});
    }

    function clear(runtime: ActiveRuntime): void {
        if (active?.id === runtime.id) {
            active = null;
            store.setState({active: null});
        }
    }

    function start<State, Event, Step extends string>(
        definition: InteractionDefinition<Step, State, Event>,
    ): InteractionHandle<State, Event, Step> {
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
            () => publish(runtime),
            () => clear(runtime),
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
    };
}

class RuntimeInteraction<State, Event, Step extends string> implements InteractionHandle<State, Event, Step>, ActiveRuntime {
    readonly id: string;
    private readonly definition: InteractionDefinition<Step, State, Event>;
    private readonly publishSnapshot: () => void;
    private readonly clearSnapshot: () => void;
    private status: "running" | "completed" | "failed" | "cancelled" = "running";
    private error: unknown | null = null;
    private state: State;
    private stepName: Step;
    private step: InteractionStep<State, Event, Step>;
    private stepExited = false;

    constructor(
        definition: InteractionDefinition<Step, State, Event>,
        id: string,
        step: InteractionStep<State, Event, Step>,
        publishSnapshot: () => void,
        clearSnapshot: () => void,
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
        return this.typedSnapshot();
    }

    snapshot(): InteractionSnapshot<unknown, string> {
        return this.typedSnapshot() as InteractionSnapshot<unknown, string>;
    }

    dispatch(event: unknown): boolean {
        return this.dispatchTyped(event as Event);
    }

    private dispatchTyped(event: Event): boolean {
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
                this.publishSnapshot();
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
        // Cancellation must remain safe even if cleanup code itself fails.
        try {
            this.exitCurrentStep();
        } catch {
            // The interaction is already cancelled; there is no recovery path here.
        }
        this.publishSnapshot();
        this.clearSnapshot();
    }

    enter(): void {
        try {
            this.step.enter?.(this.context());
            if (this.status === "running") {
                this.publishSnapshot();
            }
            if (this.status === "running" && this.step.terminal) {
                this.complete();
            }
        } catch (error) {
            this.fail(error);
        }
    }

    private typedSnapshot(): InteractionSnapshot<State, Step> {
        return {
            id: this.id,
            key: this.definition.key,
            status: this.status,
            step: this.stepName,
            state: this.state,
            error: this.error,
        };
    }

    private transitionTo(stepName: Step): void {
        const nextStep = this.definition.steps[stepName];
        if (!nextStep) {
            throw new InteractionDefinitionError(`Missing step: ${stepName}`);
        }
        this.exitCurrentStep();
        this.step = nextStep;
        this.stepName = stepName;
        this.stepExited = false;
        this.publishSnapshot();
        this.step.enter?.(this.context());
        if (this.status === "running") {
            this.publishSnapshot();
        }
        if (this.status === "running" && this.step.terminal) {
            this.complete();
        }
    }

    private context(): InteractionContext<State, Event> {
        return {
            id: this.id,
            state: this.state,
            dispatch: event => this.dispatchTyped(event),
        };
    }

    private exitCurrentStep(): void {
        if (this.stepExited) {
            return;
        }
        this.stepExited = true;
        this.step.exit?.(this.context());
    }

    private fail(error: unknown): void {
        if (this.status !== "running") {
            return;
        }
        this.status = "failed";
        this.error = error;
        // Preserve the original failure if cleanup itself is faulty.
        try {
            this.exitCurrentStep();
        } catch {
            // Cleanup is best-effort once the interaction has failed.
        }
        this.publishSnapshot();
        this.clearSnapshot();
    }

    private complete(): void {
        if (this.status !== "running") {
            return;
        }
        this.status = "completed";
        this.exitCurrentStep();
        this.publishSnapshot();
        this.clearSnapshot();
    }
}
