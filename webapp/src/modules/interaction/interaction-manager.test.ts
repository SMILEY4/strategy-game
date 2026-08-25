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
        const manager = createInteractionManager();

        manager.start(basicDefinition);

        expect(() => manager.start(basicDefinition)).toThrow(InteractionBusyError);
    });

    it("dispatches events through graph steps and completes terminal steps", () => {
        const manager = createInteractionManager();
        const handle = manager.start(basicDefinition);

        handle.dispatch({type: "change", value: "draft"});
        expect(handle.getSnapshot().state.value).toBe("draft");

        handle.dispatch({type: "finish"});
        expect(manager.getSnapshot()).toBeNull();
        expect(handle.getSnapshot().status).toBe("completed");
    });

    it("runs enter hooks after moving to a new step", () => {
        const manager = createInteractionManager();
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

    it("runs the current step exit hook when cancelled", () => {
        const manager = createInteractionManager();
        let exited = false;
        const handle = manager.start(defineInteraction({
            key: "cleanup",
            initialStep: "editing",
            initialState: {value: ""},
            steps: {
                editing: {
                    exit: () => {
                        exited = true;
                    },
                    handle: () => undefined,
                },
            },
        }));

        handle.cancel();
        expect(exited).toBe(true);
    });

    it("ignores events dispatched after cancellation", () => {
        const manager = createInteractionManager();
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

    it("supports unrelated interaction types on one manager", () => {
        const manager = createInteractionManager();
        const settlement = manager.start(defineInteraction({
            key: "settlement",
            initialStep: "naming",
            initialState: {name: ""},
            steps: {
                naming: {
                    handle: (_state: { name: string }, event: { type: "name"; value: string } | { type: "finish" }) => {
                        if (event.type === "name") return {state: {name: event.value}};
                        return {to: "completed"};
                    },
                },
                completed: {terminal: true, handle: () => undefined},
            },
        }));

        settlement.dispatch({type: "name", value: "Arrakis"});
        settlement.dispatch({type: "finish"});
        expect(settlement.getSnapshot().state.name).toBe("Arrakis");

        const exploration = manager.start(defineInteraction({
            key: "exploration",
            initialStep: "selecting",
            initialState: {tile: null as string | null},
            steps: {
                selecting: {
                    handle: (_state: { tile: string | null }, event: { type: "tile"; value: string } | { type: "finish" }) => {
                        if (event.type === "tile") return {state: {tile: event.value}};
                        return {to: "completed"};
                    },
                },
                completed: {terminal: true, handle: () => undefined},
            },
        }));

        exploration.dispatch({type: "tile", value: "3:4"});
        expect(exploration.getSnapshot().state.tile).toBe("3:4");
    });
});
