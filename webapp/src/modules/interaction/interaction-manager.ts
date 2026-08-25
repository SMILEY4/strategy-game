import {createStore} from "zustand/vanilla";
import {InteractionBusyError, InteractionCancelledError, InteractionDefinitionError} from "./interaction-errors.ts";
import type {
    InteractionCancelReason,
    InteractionContext,
    InteractionDefinition,
    InteractionHandle,
    InteractionHost,
    InteractionManager,
    InteractionOperation,
    InteractionSnapshot,
    InteractionStep,
    InteractionStoreState,
    InteractionWindow,
} from "./interaction.types.ts";

export function createInteractionManager<State = unknown, Event = unknown>(options: {
    host?: InteractionHost;
} = {}): InteractionManager<State, Event> {
    const store = createStore<InteractionStoreState<State>>(() => ({active: null}));
    let active: RuntimeInteraction<State, Event> | null = null;

    function getSnapshot(): InteractionSnapshot<State> | null {
        return store.getState().active;
    }

    function publish(runtime: RuntimeInteraction<State, Event>): void {
        store.setState({active: runtime.snapshot()});
    }

    function clear(runtime: RuntimeInteraction<State, Event>): void {
        if (active?.id === runtime.id) {
            active = null;
            store.setState({active: null});
        }
    }

    function start(definition: InteractionDefinition<State, Event>): InteractionHandle<State, Event> {
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
            options.host,
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
        getSnapshot,
        subscribe: store.subscribe,
        cancelActive: reason => active?.cancel(reason),
        store,
    };
}

class RuntimeInteraction<State, Event> implements InteractionHandle<State, Event> {
    readonly id: string;
    private readonly controller = new AbortController();
    private readonly windows = new Map<string, InteractionWindow>();
    private readonly definition: InteractionDefinition<State, Event>;
    private readonly host: InteractionHost | undefined;
    private readonly publishSnapshot: (runtime: RuntimeInteraction<State, Event>) => void;
    private readonly clearSnapshot: (runtime: RuntimeInteraction<State, Event>) => void;
    private status: "running" | "completed" | "failed" | "cancelled" = "running";
    private error: unknown | null = null;
    private state: State;
    private stepName: string;

    constructor(
        definition: InteractionDefinition<State, Event>,
        id: string,
        step: InteractionStep<State, Event>,
        host: InteractionHost | undefined,
        publishSnapshot: (runtime: RuntimeInteraction<State, Event>) => void,
        clearSnapshot: (runtime: RuntimeInteraction<State, Event>) => void,
    ) {
        this.definition = definition;
        this.id = id;
        this.step = step;
        this.host = host;
        this.publishSnapshot = publishSnapshot;
        this.clearSnapshot = clearSnapshot;
        this.state = definition.initialState;
        this.stepName = definition.initialStep;
    }

    private step: InteractionStep<State, Event>;

    getSnapshot(): InteractionSnapshot<State> {
        return this.snapshot();
    }

    dispatch(event: Event): boolean {
        if (this.status !== "running") {
            return false;
        }

        try {
            const context = this.context();
            const transition = this.step.handle(this.state, event, context);
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

    cancel(reason: InteractionCancelReason = {type: "user", source: "button"}): void {
        if (this.status !== "running") {
            return;
        }
        this.status = "cancelled";
        this.error = new InteractionCancelledError(reason);
        this.controller.abort(this.error);
        this.closeWindows();
        this.publishSnapshot(this);
        this.clearSnapshot(this);
    }

    enter(): void {
        try {
            this.step.enter?.(this.context());
            this.publishSnapshot(this);
            if (this.step.terminal) {
                this.complete();
            }
        } catch (error) {
            this.fail(error);
        }
    }

    snapshot(): InteractionSnapshot<State> {
        return {
            id: this.id,
            key: this.definition.key,
            status: this.status,
            step: this.stepName,
            state: this.state,
            error: this.error,
            windowIds: [...this.windows.keys()],
        };
    }

    private transitionTo(stepName: string): void {
        const nextStep = this.definition.steps[stepName];
        if (!nextStep) {
            throw new InteractionDefinitionError(`Missing step: ${stepName}`);
        }

        const previousContext = this.context();
        this.step.exit?.(previousContext);
        this.step = nextStep;
        this.stepName = stepName;
        this.publishSnapshot(this);
        this.step.enter?.(this.context());
        this.publishSnapshot(this);
        if (this.step.terminal) {
            this.complete();
        }
    }

    private context(): InteractionContext<State, Event> {
        return {
            id: this.id,
            signal: this.controller.signal,
            state: this.state,
            dispatch: event => this.dispatch(event),
            openWindow: window => this.openWindow(window),
            closeWindow: windowId => this.closeWindow(windowId),
            startOperation: operation => this.startOperation(operation),
        };
    }

    private openWindow(window: InteractionWindow): void {
        if (this.status !== "running" || this.windows.has(window.id)) {
            return;
        }
        this.windows.set(window.id, window);
        try {
            if (this.host) {
                this.host.openWindow(window, this.id);
            } else {
                window.open(this.id);
            }
            this.publishSnapshot(this);
        } catch (error) {
            this.windows.delete(window.id);
            throw error;
        }
    }

    private closeWindow(windowId: string): void {
        const window = this.windows.get(windowId);
        if (!window) {
            return;
        }
        this.windows.delete(windowId);
        if (this.host) {
            this.host.closeWindow(window, this.id);
        } else {
            window.close?.(this.id);
        }
        this.publishSnapshot(this);
    }

    private closeWindows(): void {
        for (const windowId of [...this.windows.keys()]) {
            this.closeWindow(windowId);
        }
    }

    private startOperation<T>(operation: InteractionOperation<T, Event>): void {
        if (this.status !== "running") {
            return;
        }
        void operation.run(this.controller.signal).then(value => {
            if (this.status === "running") {
                this.dispatch(operation.onSuccess(value));
            }
        }).catch(error => {
            if (this.status === "running") {
                this.dispatch(operation.onFailure(error));
            }
        });
    }

    private fail(error: unknown): void {
        if (this.status !== "running") {
            return;
        }
        this.status = "failed";
        this.error = error;
        this.controller.abort(error);
        this.closeWindows();
        this.publishSnapshot(this);
        this.clearSnapshot(this);
    }

    private complete(): void {
        if (this.status !== "running") {
            return;
        }
        this.status = "completed";
        this.closeWindows();
        this.publishSnapshot(this);
        this.clearSnapshot(this);
    }
}
