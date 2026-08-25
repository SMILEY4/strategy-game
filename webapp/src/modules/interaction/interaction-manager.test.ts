import {describe, expect, it, vi} from "vitest";
import {InteractionBusyError} from "./interaction-errors.ts";
import {createInteractionManager} from "./interaction-manager.ts";
import type {InteractionDefinition, InteractionWindow} from "./interaction.types.ts";

type State = {
    value: string;
};

type Event =
    | { type: "change"; value: string }
    | { type: "finish" }
    | { type: "success" };

function definition(overrides: Partial<InteractionDefinition<State, Event>> = {}): InteractionDefinition<State, Event> {
    return {
        key: "test",
        initialStep: "editing",
        initialState: {value: ""},
        steps: {
            editing: {
                handle: (_state, event) => {
                    if (event.type === "change") {
                        return {state: {value: event.value}};
                    }
                    if (event.type === "finish") {
                        return {to: "completed"};
                    }
                    return undefined;
                },
            },
            completed: {
                terminal: true,
                handle: () => undefined,
            },
        },
        ...overrides,
    };
}

describe("createInteractionManager", () => {
    it("allows only one active interaction", () => {
        const manager = createInteractionManager<State, Event>();

        manager.start(definition());

        expect(() => manager.start(definition())).toThrow(InteractionBusyError);
    });

    it("dispatches events through graph steps and completes terminal steps", () => {
        const manager = createInteractionManager<State, Event>();
        const handle = manager.start(definition());

        handle.dispatch({type: "change", value: "draft"});
        expect(handle.getSnapshot().state.value).toBe("draft");

        handle.dispatch({type: "finish"});
        expect(manager.getSnapshot()).toBeNull();
        expect(handle.getSnapshot().status).toBe("completed");
    });

    it("opens and closes nested windows owned by the interaction", () => {
        const opened: string[] = [];
        const closed: string[] = [];
        const manager = createInteractionManager<State, Event>({
            host: {
                openWindow: (window, interactionId) => {
                    opened.push(`${window.id}:${interactionId}`);
                },
                closeWindow: (window, interactionId) => {
                    closed.push(`${window.id}:${interactionId}`);
                },
            },
        });
        const windowA: InteractionWindow = {id: "a", open: vi.fn()};
        const windowB: InteractionWindow = {id: "b", open: vi.fn()};
        const handle = manager.start(definition({
            steps: {
                editing: {
                    enter: context => {
                        context.openWindow(windowA);
                        context.openWindow(windowB);
                    },
                    handle: state => ({state}),
                },
                completed: {terminal: true, handle: () => undefined},
            },
        }));

        expect(handle.getSnapshot().windowIds).toEqual(["a", "b"]);
        handle.cancel();
        expect(opened).toHaveLength(2);
        expect(closed).toHaveLength(2);
        expect(handle.getSnapshot().status).toBe("cancelled");
    });

    it("dispatches async operation results back into the graph", async () => {
        const manager = createInteractionManager<State, Event>();
        const handle = manager.start(definition({
            steps: {
                editing: {
                    handle: (_state, event, context) => {
                        if (event.type === "finish") {
                            context.startOperation({
                                run: async () => "ok",
                                onSuccess: () => ({type: "success"}),
                                onFailure: () => ({type: "change", value: "error"}),
                            });
                            return {to: "submitting"};
                        }
                        return undefined;
                    },
                },
                submitting: {
                    handle: (_state, event) => event.type === "success" ? {to: "completed"} : undefined,
                },
                completed: {terminal: true, handle: () => undefined},
            },
        }));

        handle.dispatch({type: "finish"});
        await vi.waitFor(() => expect(handle.getSnapshot().status).toBe("completed"));
    });

    it("aborts active operations when cancelled", async () => {
        const manager = createInteractionManager<State, Event>();
        let signal: AbortSignal | undefined;
        const handle = manager.start(definition({
            steps: {
                editing: {
                    handle: (_state, event, context) => {
                        if (event.type === "finish") {
                            context.startOperation({
                                run: currentSignal => new Promise(() => {
                                    signal = currentSignal;
                                }),
                                onSuccess: () => ({type: "success"}),
                                onFailure: () => ({type: "change", value: "error"}),
                            });
                            return {to: "submitting"};
                        }
                        return undefined;
                    },
                },
                submitting: {handle: () => undefined},
            },
        }));

        handle.dispatch({type: "finish"});
        await vi.waitFor(() => expect(signal).toBeDefined());
        handle.cancel();
        expect(signal?.aborted).toBe(true);
        expect(handle.getSnapshot().status).toBe("cancelled");
    });
});
