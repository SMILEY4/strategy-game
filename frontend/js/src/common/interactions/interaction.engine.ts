import {InteractionEvent} from "./interaction.event";
import {InteractionDefinition, InteractionEndReason} from "./interaction.definition";
import {InteractionContextAdapter} from "./interaction.context-adapter";

/**
 * Typesafe api for interacting with a specific interaction
 */
export interface InteractionApi<TEvent extends InteractionEvent, TState extends string, TContext> {
    isActive: () => boolean;
    getState: () => TState;
    dispatch: (event: TEvent) => void,
    getContext: () => TContext,
    setContext: (update: (ctx: TContext) => TContext) => void,
}

/**
 * Utility type for the currently active interaction.
 */
interface ActiveInteraction<TEvent extends InteractionEvent> {
    definition: InteractionDefinition<any, TEvent, any>,
    currentState: string
}

/**
 * Executes and handles interactions, processes events.
 */
export class InteractionEngine<TEvent extends InteractionEvent> {

    private activeInteraction: ActiveInteraction<TEvent> | null = null;
    private eventQueue: TEvent[] = [];
    private isProcessing = false;

    constructor(private readonly contextAdapter: InteractionContextAdapter) {
    }

    /**
     * Get a typesafe api handle for any interaction (does not need to be the current interaction).
     * Warning: before using these api function, check whether the interaction is currently active!
     */
    public getInteractionApi<TInteractionEvent extends TEvent, TState extends string, TContext>(interactionId: string): InteractionApi<TInteractionEvent, TState, TContext> | null {
        return {
            isActive: () => this.getInteractionId() === interactionId,
            getState: () => this.getInteractionState() as TState,
            dispatch: async (event: TInteractionEvent) => await this.dispatch(event),
            getContext: () => this.contextAdapter.get() as TContext,
            setContext: update => this.contextAdapter.update(update),
        };
    }

    /**
     * @return the id of the currently active interaction (or null).
     */
    public getInteractionId(): string | null {
        return this.activeInteraction?.definition.id ?? null;
    }

    /**
     * @return the current state of the currently active interaction (or null).
     */
    public getInteractionState(): string | null {
        return this.activeInteraction?.currentState ?? null;
    }

    public getInteractionContext<TContext>(): TContext | null {
        return this.activeInteraction
            ? this.contextAdapter.get()
            : null;
    }

    /**
     * Starts a new interaction. Ends the current one if necessary.
     * @param interaction the definition of the new interaction to start
     * @param initialContext the (optional) initial context to use instead of the one from the definition
     */
    public async start<TState extends string, TContext>(interaction: InteractionDefinition<TState, TEvent, TContext>, initialContext?: TContext) {
        // stop a previous interaction
        this.endInteraction("interruption");
        // prepare and start the new interaction
        this.activeInteraction = {
            definition: interaction,
            currentState: interaction.initial,
        };
        this.contextAdapter.set(initialContext ?? interaction.context);
        // run the "on start" action of the interaction
        this.activeInteraction.definition.onStart?.({
            getCtx: () => this.contextAdapter.get,
            setCtx: (updater) => this.contextAdapter.update(updater),
        });
        // run the "on-enter" actions of the initial state
        const initialStateDefinition = this.activeInteraction.definition.states[this.activeInteraction.currentState];
        await initialStateDefinition.onEnter?.({
            getCtx: () => this.contextAdapter.get,
            setCtx: (updater) => this.contextAdapter.update(updater),
            dispatch: async e => await this.dispatch(e),
        });
    }

    /**
     * Ends the current interaction.
     */
    public end() {
        this.endInteraction("engine-end");
    }

    private endInteraction(reason: InteractionEndReason) {
        if (this.activeInteraction) {
            // run the "on-end" action of the current interaction
            this.activeInteraction.definition.onEnd?.({
                reason: reason,
                state: this.activeInteraction.currentState,
                getCtx: () => this.contextAdapter.get,
                setCtx: (updater) => this.contextAdapter.update(updater),
            });
            // end the interaction and clean up
            this.activeInteraction = null;
            this.eventQueue = [];
            this.isProcessing = false;
            this.contextAdapter.clear();
        }
    }

    /**
     * Dispatch the given event to be handled by the currently active interaction
     * @param event the event
     */
    public async dispatch<T extends TEvent>(event: T) {
        if (!this.activeInteraction) return;
        this.eventQueue.push(event);
        await this.processQueue();
    }

    private async processQueue() {
        // already processing the queue, prevent re-entrancy
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            // process events in queue
            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift();
                if (event) {
                    await this.processEvent(event);
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    private async processEvent(event: TEvent) {
        if (!this.activeInteraction) return;

        // find definition of current state and transition
        const stateDefinition = this.activeInteraction.definition.states[this.activeInteraction.currentState];
        const transitionDefinition = stateDefinition.transitions[event.eventId as TEvent["eventId"]];
        if (!transitionDefinition) {
            return;
        }

        // run transition action
        await transitionDefinition.action?.({
            event: event as any,
            getCtx: () => this.contextAdapter.get,
            setCtx: (updater) => this.contextAdapter.update(updater),
        });

        // run on-enter action
        this.activeInteraction.currentState = transitionDefinition.target;
        const targetStateDefinition = this.activeInteraction.definition.states[transitionDefinition.target];
        await targetStateDefinition.onEnter?.({
            getCtx: () => this.contextAdapter.get,
            setCtx: (updater) => this.contextAdapter.update(updater),
            dispatch: async e => await this.dispatch(e),
        });

        // check if state is end state. End interaction if required.
        if (targetStateDefinition.end) {
            this.endInteraction("end-state");
        }
    }

}