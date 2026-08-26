import {describe, expect, test, vi} from "vitest";
import {createInteractionDefinition} from "./interaction.definition.ts";
import {
    createInteractionMachine,
    type InteractionMachineState,
} from "./interaction.machine.ts";

type State = "idle" | "active" | "done";
type Event =
    | {type: "START"}
    | {type: "SET_VALUE"; value: number}
    | {type: "FINISH"}
    | {type: "IGNORED"};
type Context = {value: number; allowed: boolean};

function createMachine(
    definition: ReturnType<typeof createDefinition>,
): {
    machine: ReturnType<typeof createInteractionMachine<State, Event, Context>>;
    getState: () => InteractionMachineState<Context, State>;
} {
    let state: InteractionMachineState<Context, State>;
    const getState = () => state;
    const machine = createInteractionMachine(definition, undefined, nextState => {
        state = nextState;
    }, getState);
    return {machine, getState};
}

function createDefinition() {
    return createInteractionDefinition<State, Event, Context>({
        initialState: () => "idle",
        initialContext: () => ({value: 0, allowed: true}),
        states: {
            idle: {
                START: {target: "active"},
                IGNORED: {target: "idle"},
            },
            active: {
                SET_VALUE: {
                    target: "active",
                    reenter: false,
                    action: ({event}) => ({value: event.value}),
                },
                FINISH: {
                    target: "done",
                    guard: ({context}) => context.allowed,
                },
            },
            done: {terminal: true, START: {target: "idle"}},
        },
    });
}

describe("createInteractionMachine", () => {
    test("initializes the machine and runs a normal transition", () => {
        const entered = vi.fn(({event}: {event: {type: string}}) => {
            if (event.type === "__INIT__") {
                return {value: 1};
            }
        });
        const exited = vi.fn(({context}: {context: Context; event: Event}) => ({value: context.value + 1}));
        const definition = createDefinition();
        definition.states.idle.onEnter = entered;
        definition.states.idle.onExit = exited;

        const {machine, getState} = createMachine(definition);
        machine.send({type: "START"});

        expect(entered).toHaveBeenCalledOnce();
        expect(exited).toHaveBeenCalledOnce();
        expect(getState().stateName).toBe("active");
        expect(getState().context).toEqual({value: 2, allowed: true});
    });

    test("runs exit, action, and enter hooks with updated context", () => {
        const calls: string[] = [];
        const definition = createDefinition();
        definition.states.idle.onExit = ({context}) => {
            calls.push(`exit:${context.value}`);
            return {value: context.value + 1};
        };
        definition.states.active.onEnter = ({context}) => {
            calls.push(`enter:${context.value}`);
        };
        definition.states.active.SET_VALUE!.action = ({context, event}) => {
            calls.push(`action:${context.value}`);
            return {value: event.value};
        };

        const {machine} = createMachine(definition);
        machine.send({type: "START"});
        machine.send({type: "SET_VALUE", value: 10});

        expect(calls).toEqual(["exit:0", "enter:1", "action:1"]);
    });

    test("supports guarded transitions and ignores unknown transitions", () => {
        const {machine, getState} = createMachine(createDefinition());

        machine.send({type: "IGNORED"});
        machine.send({type: "START"});
        getState().context.allowed = false;
        machine.send({type: "FINISH"});

        expect(getState().stateName).toBe("active");
    });

    test("does not reenter a self-transition unless requested", () => {
        const entered = vi.fn();
        const definition = createDefinition();
        definition.states.active.onEnter = entered;
        const {machine} = createMachine(definition);

        machine.send({type: "START"});
        machine.send({type: "SET_VALUE", value: 5});

        expect(entered).toHaveBeenCalledOnce();
    });

    test("reenters a self-transition when requested", () => {
        const entered = vi.fn();
        const definition = createDefinition();
        definition.states.active.onEnter = entered;
        definition.states.active.SET_VALUE!.reenter = true;
        const {machine} = createMachine(definition);

        machine.send({type: "START"});
        machine.send({type: "SET_VALUE", value: 5});

        expect(entered).toHaveBeenCalledTimes(2);
    });

    test("does not process events in a terminal state", () => {
        const {machine, getState} = createMachine(createDefinition());

        machine.send({type: "START"});
        machine.send({type: "FINISH"});
        machine.send({type: "START"});

        expect(getState().stateName).toBe("done");
    });
});
