import {describe, expect, it} from "vitest";
import {InteractionBusyError} from "./interaction-errors.ts";
import {createInteractionManager} from "./interaction-manager.ts";
import {defineInteraction} from "./interaction.types.ts";

type State = { value: string };
type Event =
    | { type: "change"; value: string }
    | { type: "finish" }
    | { type: "success" };

const basicDefinition = defineInteraction({
    key: "test",
    initialStep: "editing",
    initialState: {value: ""},
    steps: {
        editing: {
            handle: (_state: State, event: Event) => {
                if (event.type === "change") return {state: {value: event.value}};
                if (event.type === "finish") return {to: "completed"};
                return undefined;
            },
        },
        completed: {
            terminal: true,
            handle: () => undefined,
        },
    },
});

describe("createInteractionManager", () => {
    it("allows only one active interaction", () => {
        const manager = createInteractionManager<State, Event>();

        manager.start(basicDefinition);

        expect(() => manager.start(basicDefinition)).toThrow(InteractionBusyError);
    });

    it("dispatches events through graph steps and completes terminal steps", () => {
        const manager = createInteractionManager<State, Event>();
        const handle = manager.start(basicDefinition);

        handle.dispatch({type: "change", value: "draft"});
        expect(handle.getSnapshot().state.value).toBe("draft");

        handle.dispatch({type: "finish"});
        expect(manager.getSnapshot()).toBeNull();
        expect(handle.getSnapshot().status).toBe("completed");
    });

    it("runs enter hooks after moving to a new step", () => {
        const manager = createInteractionManager<State, Event>();
        let enteredState = "";
        const handle = manager.start(defineInteraction({
            key: "effects",
            initialStep: "editing",
            initialState: {value: "initial"},
            steps: {
                editing: {
                    handle: (_state: State, event: Event) => event.type === "finish"
                        ? {to: "submitting"}
                        : undefined,
                },
                submitting: {
                    enter: context => {
                        enteredState = context.state.value;
                        context.dispatch({type: "success"});
                    },
                    handle: (_state: State, event: Event) => event.type === "success"
                        ? {to: "completed"}
                        : undefined,
                },
                completed: {terminal: true, handle: () => undefined},
            },
        }));

        handle.dispatch({type: "finish"});
        expect(enteredState).toBe("initial");
        expect(handle.getSnapshot().status).toBe("completed");
    });

    it("ignores events dispatched after cancellation", () => {
        const manager = createInteractionManager<State, Event>();
        const handle = manager.start(defineInteraction({
            key: "cancel",
            initialStep: "waiting",
            initialState: {value: ""},
            steps: {
                waiting: {
                    handle: () => undefined,
                },
            },
        }));

        handle.cancel();
        handle.dispatch({type: "change", value: "late"});
        expect(handle.getSnapshot().state.value).toBe("");
        expect(handle.getSnapshot().status).toBe("cancelled");
    });
});
