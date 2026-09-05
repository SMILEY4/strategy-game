import {createInteractionDefinition} from "@modules/interaction/interaction.definition.ts";
import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";
import {openWindowCreateSettlement} from "@pages/game/gameui/settlement/create/CreateSettlementWindow.tsx";
import {DI} from "@app/app.ts";
import {getParameterGameId} from "@pages/routing.tsx";
import {closeWindow} from "@modules/uicomponents/window/useWindow.ts";
import {genCommandId} from "@app/features/game/models/command.ts";
import {gameAudio} from "@app/audio/gameAudio.ts";

interface CreateSettlementInteractionInput {
    position: ExtendedHexPosition;
}

interface CreateSettlementInteractionContext {
    position: ExtendedHexPosition,
    name: string | null,
    createSettlementWindowId: string | null
}

type CreateSettlementInteractionState =
    | "Prepare"
    | "ConfiguringSettlement"
    | "Finalizing"
    | "Aborted"

export type CreateSettlementInteractionEvent =
    | { type: "PREPARATION_DONE" }
    | { type: "SELECT_NAME", name: string }
    | { type: "RANDOMIZE_NAME" }
    | { type: "CONFIRM" }
    | { type: "ABORT" }


export const CreateSettlementInteraction = createInteractionDefinition<
    CreateSettlementInteractionState,
    CreateSettlementInteractionEvent,
    CreateSettlementInteractionContext,
    CreateSettlementInteractionInput
>({
    initialState: () => "Prepare",
    initialContext: input => ({
        position: input.position,
        name: null,
        createSettlementWindowId: null,
    }),
    states: {

        Prepare: {
            onEnter: async () => {
                const name = await DI.gameClient.getSettlementName(getParameterGameId());
                return {
                    context: {name: name},
                    event: {type: "PREPARATION_DONE"},
                };
            },
            PREPARATION_DONE: {
                target: "ConfiguringSettlement",
            },
        },

        ConfiguringSettlement: {
            onEnter: ({event}) => {
                if (event.type === "PREPARATION_DONE") {
                    const windowId = openWindowCreateSettlement();
                    return {createSettlementWindowId: windowId};
                }
            },
            SELECT_NAME: {
                action: ({event}) => {
                    return {name: event.name};
                },
                target: "ConfiguringSettlement",
                reenter: false,
            },
            RANDOMIZE_NAME: {
                action: async () => {
                    const name = await DI.gameClient.getSettlementName(getParameterGameId());
                    return { name: name }
                },
                target: "ConfiguringSettlement",
                reenter: false,
            },
            CONFIRM: {
                target: "Finalizing",
            },
            ABORT: {
                target: "Aborted"
            }
        },

        Finalizing: {
            terminal: true,
            onEnter: ({context}) => {
                if (context.createSettlementWindowId) {
                    closeWindow(context.createSettlementWindowId);
                }
                DI.commandDatabase.insert({
                    type: "create-settlement",
                    id: genCommandId(),
                    location: context.position,
                    name: context.name ?? ""
                })
                gameAudio.WRITING_ON_PAPER.play();
            },
        },

        Aborted: {
            terminal: true,
            onEnter: ({context}) => {
                if (context.createSettlementWindowId) {
                    closeWindow(context.createSettlementWindowId);
                }
            },
        },

    },
});
