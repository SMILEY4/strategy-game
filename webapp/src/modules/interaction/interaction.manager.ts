import {createInteractionMachine, type InteractionMachine, type InteractionMachineState} from "@modules/interaction/interaction.machine.ts";
import type {InteractionBaseEvent, InteractionDefinition} from "@modules/interaction/interaction.definition.ts";

export interface InteractionManager {

    start: <
        TStateName extends string,
        TEvent extends InteractionBaseEvent,
        TContext, TInput = undefined
    >(definition: InteractionDefinition<TInput, TContext, TEvent, TStateName>, input: TInput) => Promise<void>;

    stop: () => void;

    send: <TEvent extends InteractionBaseEvent>(event: TEvent) => Promise<void>;
}

interface Dependencies {
    setMachineState: (state: InteractionMachineState<any, string> | null) => void,
    getMachineState: () => InteractionMachineState<any, string> | null,
}

export const interactionManager = ({getMachineState, setMachineState}: Dependencies): InteractionManager => {

    let activeMachine: InteractionMachine<any, any, any> | null = null;

    async function start<
        TStateName extends string,
        TEvent extends InteractionBaseEvent,
        TContext,
        TInput = undefined
    >(
        definition: InteractionDefinition<TInput, TContext, TEvent, TStateName>, input: TInput,
    ) {
        if (activeMachine !== null) {
            throw new Error("Can not start a new interaction when one is already active");
        }
        activeMachine = await createInteractionMachine<string, any, any, any>(definition, input, setMachineState, getMachineState);
    }

    function stop() {
        activeMachine?.stop();
        activeMachine = null;
    }

    async function send<TEvent extends InteractionBaseEvent>(event: TEvent) {
        await activeMachine?.send(event);
    }

    return {
        start: start,
        stop: stop,
        send: send,
    };
};