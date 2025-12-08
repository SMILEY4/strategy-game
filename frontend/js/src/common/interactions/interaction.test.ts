import {InteractionDefinition} from "./interaction.definition";
import {InteractionContextAdapter} from "./interaction.context-adapter";
import {InteractionEngine} from "./interaction.engine";

describe("interaction tests", () => {

    test("no current interaction, expect nothing", async () => {
        clearLog();
        const engine = new InteractionEngine<TestEvents>(testInteractionContextAdapter);
        expect(engine.getInteractionId()).toBeNull();
        expect(engine.getInteractionState()).toBeNull();
        expect(engine.getInteractionContext()).toBeNull();
        await engine.dispatch({eventId: "RETRY"});
        engine.end();
        expect(actionLog).toStrictEqual([]);
        clearLog();
    });

    test("run single interaction, expect success", async () => {
        clearLog();
        const engine = new InteractionEngine<TestEvents>(testInteractionContextAdapter);

        // start interaction, expect initial state
        await engine.start(interactionADefinition, {name: "hello test"},);
        expect(engine.getInteractionId()).toBe("test.sample.a");
        expect(engine.getInteractionState()).toBe("IDLE");
        expect(engine.getInteractionContext()).toStrictEqual({name: "hello test"});
        expect(actionLog).toStrictEqual([
            "test.sample.a#onStart",
            "test.sample.a#IDLE_onEnter",
        ]);
        clearLog();

        // dispatch valid event, expect state transition
        await engine.dispatch<TestInteractionAEvents>({eventId: "CLICK", x: 42, y: -32});
        expect(engine.getInteractionId()).toBe("test.sample.a");
        expect(engine.getInteractionState()).toBe("FETCHING");
        expect(actionLog).toStrictEqual([
            "test.sample.a#CLICK_action",
            "test.sample.a#FETCHING_onEnter",
        ]);
        clearLog();

        // dispatch invalid event, expect no state transition
        await engine.dispatch<TestInteractionAEvents>({eventId: "CLICK", x: 11, y: 22});
        expect(engine.getInteractionId()).toBe("test.sample.a");
        expect(engine.getInteractionState()).toBe("FETCHING");
        expect(actionLog).toStrictEqual([]);
        clearLog();

        // end interaction, expect empty engine
        engine.end();
        expect(engine.getInteractionId()).toBeNull();
        expect(engine.getInteractionState()).toBeNull();
        expect(engine.getInteractionContext()).toBeNull();
        expect(actionLog).toStrictEqual([
            "test.sample.a#onEnd",
        ]);
        clearLog();
    });

    test("interrupt interaction, expect success", async () => {
        clearLog();
        const engine = new InteractionEngine<TestEvents>(testInteractionContextAdapter);

        // start first interaction, expect initial state
        await engine.start(interactionADefinition, {name: "hello test"},);
        expect(engine.getInteractionId()).toBe("test.sample.a");
        expect(engine.getInteractionState()).toBe("IDLE");
        expect(engine.getInteractionContext()).toStrictEqual({name: "hello test"});
        expect(actionLog).toStrictEqual([
            "test.sample.a#onStart",
            "test.sample.a#IDLE_onEnter",
        ]);
        clearLog();

        // dispatch valid event, expect state transition
        await engine.dispatch<TestInteractionAEvents>({eventId: "CLICK", x: 42, y: -32});
        expect(engine.getInteractionId()).toBe("test.sample.a");
        expect(engine.getInteractionState()).toBe("FETCHING");
        expect(actionLog).toStrictEqual([
            "test.sample.a#CLICK_action",
            "test.sample.a#FETCHING_onEnter",
        ]);
        clearLog();

        // start another interaction, expect previous to end
        await engine.start(interactionBDefinition, {counter: 10});
        expect(engine.getInteractionId()).toBe("test.sample.b");
        expect(engine.getInteractionState()).toBe("IDLE");
        expect(engine.getInteractionContext()).toStrictEqual({counter: 10});
        expect(actionLog).toStrictEqual([
            "test.sample.a#onEnd",
            "test.sample.b#onStart",
            "test.sample.b#IDLE_onEnter",
        ]);
        clearLog();

        // dispatch valid event, expect state transition
        await engine.dispatch<TestInteractionBEvents>({eventId: "KEY_PRESS"});
        expect(engine.getInteractionId()).toBe("test.sample.b");
        expect(engine.getInteractionState()).toBe("RUNNING");
        expect(actionLog).toStrictEqual([
            "test.sample.b#KEY_PRESS_action",
            "test.sample.b#RUNNING_onEnter",
        ]);
        clearLog();
    });

    test("automatic end state, expect interaction to end", async () => {
        clearLog();
        const engine = new InteractionEngine<TestEvents>(testInteractionContextAdapter);

        // prepare interaction state
        await engine.start(interactionBDefinition, {counter: 10});
        await engine.dispatch<TestInteractionBEvents>({eventId: "KEY_PRESS"});
        clearLog();

        // dispatch event, expect transition to end state
        await engine.dispatch<TestInteractionBEvents>({eventId: "SHUT_DOWN"});
        expect(engine.getInteractionId()).toBeNull();
        expect(engine.getInteractionState()).toBeNull();
        expect(engine.getInteractionContext()).toBeNull();

        expect(actionLog).toStrictEqual([
            "test.sample.b#SHUT_DOWN_action",
            "test.sample.b#DONE_onEnter",
            "test.sample.b#onEnd",
        ]);
        clearLog();
    });

    test("send events from inside initial state action", async () => {
        clearLog();
        const engine = new InteractionEngine<TestEvents>(testInteractionContextAdapter);

        // start interaction, transition immediately
        await engine.start(interactionCDefinition, {});
        expect(actionLog).toStrictEqual([
            "test.sample.c#onStart",
            "test.sample.c#A_onEnter",
            "test.sample.c#NEXT_action",
            "test.sample.c#B_onEnter",
        ]);
        clearLog();
        expect(engine.getInteractionId()).toBe("test.sample.c");
        expect(engine.getInteractionState()).toBe("B");
    });

    test("send events from inside intermediate state action, transition to end state", async () => {
        clearLog();
        const engine = new InteractionEngine<TestEvents>(testInteractionContextAdapter);

        // start interaction
        await engine.start(interactionDDefinition, {});
        expect(engine.getInteractionId()).toBe("test.sample.d");
        expect(engine.getInteractionState()).toBe("A");
        clearLog();

        // transition, to next state, state auto transitions to end state
        await engine.dispatch<TestInteractionDEvents>({eventId: "NEXT_1"});
        expect(actionLog).toStrictEqual([
            "test.sample.d#NEXT_1_action",
            "test.sample.d#B_onEnter",
            "test.sample.d#NEXT_2_action",
            "test.sample.d#C_onEnter",
            "test.sample.d#onEnd",
        ]);
        clearLog();
        expect(engine.getInteractionId()).toBeNull();
        expect(engine.getInteractionState()).toBeNull();
        expect(engine.getInteractionContext()).toBeNull();
    });

});


let actionLog: string[];

function clearLog() {
    actionLog = [];
}

function log(interactionName: string, actionName: string) {
    actionLog.push(interactionName + "#" + actionName);
}

type TestInteractionAEvents =
    | { eventId: "CLICK"; x: number; y: number }
    | { eventId: "SUCCESS"; result: string }
    | { eventId: "FAIL"; error: Error }
    | { eventId: "RETRY" };

type TestInteractionAStates = "IDLE" | "FETCHING" | "ERROR"

const interactionADefinition: InteractionDefinition<TestInteractionAStates, TestInteractionAEvents, {}> = {
    id: "test.sample.a",
    initial: "IDLE",
    onStart: () => log("test.sample.a", "onStart"),
    onEnd: () => log("test.sample.a", "onEnd"),
    states: {
        IDLE: {
            onEnter: () => log("test.sample.a", "IDLE_onEnter"),
            transitions: {
                CLICK: {
                    target: "FETCHING",
                    action: () => log("test.sample.a", "CLICK_action"),
                },
            },
        },
        FETCHING: {
            onEnter: () => log("test.sample.a", "FETCHING_onEnter"),
            transitions: {
                FAIL: {
                    target: "ERROR",
                    action: () => log("test.sample.a", "FAIL_action"),
                },
                SUCCESS: {
                    target: "IDLE",
                    action: () => log("test.sample.a", "SUCCESS_action"),
                },
            },
        },
        ERROR: {
            onEnter: () => log("test.sample.a", "ERROR_onEnter"),
            transitions: {
                RETRY: {
                    target: "FETCHING",
                    action: () => log("test.sample.a", "RETRY_action"),
                },
            },
        },
    },
};

type TestInteractionBEvents =
    | { eventId: "KEY_PRESS" }
    | { eventId: "FINISHED" }
    | { eventId: "SHUT_DOWN" }

type TestInteractionBStates = "IDLE" | "RUNNING" | "DONE"

const interactionBDefinition: InteractionDefinition<TestInteractionBStates, TestInteractionBEvents, {}> = {
    id: "test.sample.b",
    initial: "IDLE",
    onStart: () => log("test.sample.b", "onStart"),
    onEnd: () => log("test.sample.b", "onEnd"),
    states: {
        IDLE: {
            onEnter: () => log("test.sample.b", "IDLE_onEnter"),
            transitions: {
                KEY_PRESS: {
                    target: "RUNNING",
                    action: () => log("test.sample.b", "KEY_PRESS_action"),
                },
            },
        },
        RUNNING: {
            onEnter: () => log("test.sample.b", "RUNNING_onEnter"),
            transitions: {
                FINISHED: {
                    target: "IDLE",
                    action: () => log("test.sample.b", "FINISHED_action"),
                },
                SHUT_DOWN: {
                    target: "DONE",
                    action: () => log("test.sample.b", "SHUT_DOWN_action"),
                },
            },
        },
        DONE: {
            onEnter: () => log("test.sample.b", "DONE_onEnter"),
            end: true,
            transitions: {},
        },
    },
};


type TestInteractionCEvents =
    | { eventId: "NEXT" }

type TestInteractionCStates = "A" | "B"

const interactionCDefinition: InteractionDefinition<TestInteractionCStates, TestInteractionCEvents, {}> = {
    id: "test.sample.c",
    initial: "A",
    onStart: () => log("test.sample.c", "onStart"),
    onEnd: () => log("test.sample.c", "onEnd"),
    states: {
        A: {
            onEnter: ({dispatch}) => {
                log("test.sample.c", "A_onEnter");
                dispatch({eventId: "NEXT"});
            },
            transitions: {
                NEXT: {
                    target: "B",
                    action: () => log("test.sample.c", "NEXT_action"),
                },
            },
        },
        B: {
            onEnter: () => log("test.sample.c", "B_onEnter"),
            transitions: {},
        },
    },
};


type TestInteractionDEvents =
    | { eventId: "NEXT_1" }
    | { eventId: "NEXT_2" }

type TestInteractionDStates = "A" | "B" | "C"

const interactionDDefinition: InteractionDefinition<TestInteractionDStates, TestInteractionDEvents, {}> = {
    id: "test.sample.d",
    initial: "A",
    onStart: () => log("test.sample.d", "onStart"),
    onEnd: () => log("test.sample.d", "onEnd"),
    states: {
        A: {
            onEnter: () => log("test.sample.d", "A_onEnter"),
            transitions: {
                NEXT_1: {
                    target: "B",
                    action: () => log("test.sample.d", "NEXT_1_action"),
                },
            },
        },
        B: {
            onEnter: ({dispatch}) => {
                log("test.sample.d", "B_onEnter");
                dispatch({eventId: "NEXT_2"});
            },
            transitions: {
                NEXT_2: {
                    target: "C",
                    action: () => log("test.sample.d", "NEXT_2_action"),
                },
            },
        },
        C: {
            end: true,
            onEnter: () => log("test.sample.d", "C_onEnter"),
            transitions: {},
        },
    },
};


type TestEvents = TestInteractionAEvents | TestInteractionBEvents | TestInteractionCEvents | TestInteractionDEvents

let context: any = null;

const testInteractionContextAdapter: InteractionContextAdapter = {
    clear: () => {
        context = null;
    },
    get: () => context,
    set: (ctx: any) => {
        context = ctx;
    },
    update: (updater: (ctx: any) => any) => {
        context = updater(context);
        return context;
    },
};