import {createInteractionDefinition} from "@modules/interaction/interaction.definition.ts";
import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";
import {openWindowCreateSettlement} from "@pages/game/gameui/settlement/create/CreateSettlementWindow.tsx";
import {DI} from "@app/app.ts";
import {getParameterGameId} from "@pages/routing.tsx";
import {closeWindow} from "@modules/uicomponents/window/useWindow.ts";

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

export type CreateSettlementInteractionEvent =
    | { type: "PREPARATION_DONE" }
    | { type: "SELECT_NAME", name: string }
    | { type: "CONFIRM" }


export const InteractionCreateSettlement = createInteractionDefinition<
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
                    context: { name: name },
                    event: { type: "PREPARATION_DONE" }
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
                action: ({event, context}) => {
                    return {...context, name: event.name};
                },
                target: "ConfiguringSettlement",
                reenter: false,
            },
            CONFIRM: {
                target: "Finalizing",
            },
        },
        Finalizing: {
            terminal: true,
            onEnter: ({context}) => {
                if (context.createSettlementWindowId) {
                    closeWindow(context.createSettlementWindowId);
                }
            },
        },
    },
});
