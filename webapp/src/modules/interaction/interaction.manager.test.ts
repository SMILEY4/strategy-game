import {describe, expect, test, vi} from "vitest";
import {interactionManager} from "@modules/interaction/interaction.manager.ts";
import {createInteractionDefinition, type InteractionDefinition} from "@modules/interaction/interaction.definition.ts";
import type {InteractionState} from "@modules/interaction/interaction.state.ts";

type Step = "idle" | "done";

const definition = (events: string[]): InteractionDefinition<number, string, Step> => ({
    initialState: 0,
    initialStep: "idle",
    steps: {
        idle: {
            onEnter: (state, event) => {
                events.push(`enter idle:${event}`);
                return state;
            },
            onHandle: (state, event) => ({to: "done", state: state + Number(event)}),
            onExit: (state, event) => {
                events.push(`exit idle:${event}`);
                return state;
            },
        },
        done: {
            terminal: true,
            onEnter: (state, event) => {
                events.push(`enter done:${event}`);
                return state;
            },
            onExit: (state, event) => {
                events.push(`exit done:${event}`);
                return state;
            },
        },
    },
});

const createManager = () => {
    let state: InteractionState<any, any, string> = {active: null};
    const setState = vi.fn((nextState: InteractionState<any, any, string>) => {
        state = nextState;
    });
    return {manager: interactionManager({getState: () => state, setState}), setState, getState: () => state};
};

describe("interactionManager", () => {
    test("creates definitions with inferred step names", () => {
        const interaction = createInteractionDefinition<number, string>()({
            initialState: 0,
            initialStep: "idle",
            steps: {
                idle: {
                    onHandle: (state: number, event: string) => ({to: event === "finish" ? "done" : "idle", state}),
                },
                done: {terminal: true},
            },
        });
        const {manager, getState} = createManager();

        manager.start(interaction, "start");
        manager.dispatch("finish");

        expect(getState().active).toBeNull();
    });

    test("rejects unknown steps at compile time", () => {
        createInteractionDefinition<number, string>()({
            initialState: 0,
            // @ts-expect-error initialStep must be one of the declared step names.
            initialStep: "missing",
            steps: {idle: {}, done: {}},
        });

        createInteractionDefinition<number, string>()({
            initialState: 0,
            initialStep: "idle",
            steps: {
                idle: {
                    // @ts-expect-error transition targets must be declared step names.
                    onHandle: () => ({to: "missing"}),
                },
                done: {},
            },
        });
    });

    test("runs lifecycle hooks and completes terminal transitions", () => {
        const events: string[] = [];
        const {manager, getState} = createManager();

        manager.start(definition(events), "start");
        manager.dispatch("2");

        expect(events).toEqual(["enter idle:start", "exit idle:2", "enter done:2", "exit done:2"]);
        expect(getState().active).toBeNull();
    });

    test("does not drop falsy transition state values", () => {
        const {manager, getState} = createManager();
        const interaction: InteractionDefinition<number, string, Step> = {
            initialState: 5,
            initialStep: "idle",
            steps: {
                idle: {onHandle: () => ({to: "done", state: 0})},
                done: {},
            },
        };

        manager.start(interaction, "start");
        manager.dispatch("event");

        expect(getState().active?.state).toBe(0);
    });

    test("preserves an explicitly supplied null state", () => {
        const {manager, getState} = createManager();
        const interaction: InteractionDefinition<number | null, string, Step> = {
            initialState: 5,
            initialStep: "idle",
            steps: {
                idle: {onHandle: () => ({to: "done", state: null})},
                done: {},
            },
        };

        manager.start(interaction, "start");
        manager.dispatch("event");

        expect(getState().active?.state).toBeNull();
    });

    test("does not run lifecycle hooks for a same-step transition", () => {
        const events: string[] = [];
        const interaction: InteractionDefinition<number, string, Step> = {
            initialState: 1,
            initialStep: "idle",
            steps: {
                idle: {
                    onEnter: () => events.push("enter"),
                    onHandle: state => ({to: "idle", state: state + 1}),
                    onExit: () => events.push("exit"),
                },
                done: {},
            },
        };
        const {manager, getState} = createManager();

        manager.start(interaction, "start");
        manager.dispatch("event");

        expect(events).toEqual(["enter"]);
        expect(getState().active?.state).toBe(2);
    });

    test("does not activate a terminal initial step", () => {
        const interaction: InteractionDefinition<number, string, Step> = {
            initialState: 0,
            initialStep: "done",
            steps: {idle: {}, done: {terminal: true}},
        };
        const {manager, getState} = createManager();

        manager.start(interaction, "start");

        expect(getState().active).toBeNull();
    });

    test("stop clears the interaction", () => {
        const events: string[] = [];
        const {manager, getState} = createManager();

        manager.start(definition(events), "start");
        manager.stop();

        expect(events).toEqual(["enter idle:start"]);
        expect(getState().active).toBeNull();
    });

    test("rejects an unknown initial step", () => {
        const {manager} = createManager();
        const invalid = {...definition([]), initialStep: "missing" as Step};

        expect(() => manager.start(invalid, "start")).toThrow("unknown initial step");
    });

    test("ignores events without a handler or transition", () => {
        const {manager, getState, setState} = createManager();
        const interaction: InteractionDefinition<number, string, Step> = {
            initialState: 1,
            initialStep: "idle",
            steps: {idle: {}, done: {}},
        };

        manager.start(interaction, "start");
        const updatesAfterStart = setState.mock.calls.length;
        manager.dispatch("event");

        expect(setState).toHaveBeenCalledTimes(updatesAfterStart);
        expect(getState().active?.state).toBe(1);
    });

    test("rejects starting while another interaction is active", () => {
        const {manager} = createManager();
        const active = definition([]);

        manager.start(active, "start");

        expect(() => manager.start(active, "again")).toThrow("another one is already active");
    });
});
