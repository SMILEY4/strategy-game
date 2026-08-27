import {createInteractionMachine, type InteractionMachine, type InteractionMachineState} from "@modules/interaction/interaction.machine.ts";
import type {InteractionBaseEvent, InteractionDefinition} from "@modules/interaction/interaction.definition.ts";

export type InteractionEventHandlers<TEvent extends InteractionBaseEvent> = {
    [TType in TEvent["type"]]: (event: Omit<Extract<TEvent, { type: TType }>, "type">) => void;
};

export interface InteractionManager {

    start: <TStateName extends string, TEvent extends InteractionBaseEvent, TContext, TInput = undefined>(
        definition: InteractionDefinition<TInput, TContext, TEvent, TStateName>,
        input: TInput
    ) => Promise<void>;

    stop: () => void;

    events: <TEvent extends InteractionBaseEvent>(
        interaction: InteractionDefinition<any, any, TEvent, any>
    ) => InteractionEventHandlers<TEvent>;

    hasActive: () => boolean
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
        activeMachine = await createInteractionMachine<string, any, any, any>(
            definition,
            input,
            setMachineState,
            getMachineState,
            () => stop()
        );
    }

    function stop() {
        activeMachine?.stop();
        activeMachine = null;
    }

    async function sendEvent<TEvent extends InteractionBaseEvent>(
        interaction: InteractionDefinition<any, any, TEvent, any>,
        event: TEvent,
    ): Promise<void> {
        if(activeMachine?.getDefinition() !== interaction) {
            console.warn("Could not send event: no (matching) interaction")
            return
        }
        await activeMachine?.send(event);
    }

    function events<TEvent extends InteractionBaseEvent>(
        interaction: InteractionDefinition<any, any, TEvent, any>,
    ): InteractionEventHandlers<TEvent> {
        return new Proxy({}, {
            get: (_, type: string) => (event: object) => {
                void sendEvent(interaction, {
                    type: type,
                    ...event,
                } as unknown as TEvent);
            },
        }) as InteractionEventHandlers<TEvent>;
    }

    return {
        start: start,
        stop: stop,
        events: events,
        hasActive: () => !!activeMachine
    };
};
