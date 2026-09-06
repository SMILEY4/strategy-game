import {createInteractionDefinition} from "@modules/interaction/interaction.definition.ts";
import type {ExtendedHexPosition, HexPosition} from "@app/features/game/models/hex-position.ts";
import {closeWindow} from "@modules/uicomponents/window/useWindow.ts";
import {gameAudio} from "@app/audio/gameAudio.ts";
import {DI} from "@app/app.ts";
import {genCommandId} from "@app/features/game/models/command.ts";
import {openWindowCreateTileImprovement} from "@pages/game/gameui/tileimprovement/create/CreateTileImprovementWindow.tsx";
import {TileQueries} from "@app/features/game/database/tile.database.ts";
import {RealmQueries} from "@app/features/game/database/realm.database.ts";

interface CreateTileImprovementInteractionInput {
    position: ExtendedHexPosition;
}

interface CreateTileImprovementInteractionContext {
    position: ExtendedHexPosition,
    availableSettlementEntityIds: number[],
    settlementEntityId: number | null
    createTileImprovementWindowId: string | null
}

type CreateTileImprovementInteractionState =
    | "Prepare"
    | "ConfiguringTileImprovement"
    | "PickingSettlement"
    | "Finalizing"
    | "Aborted"

export type CreateTileImprovementInteractionEvent =
    | { type: "PREPARATION_DONE" }
    | { type: "PICK_SETTLEMENT" }
    | { type: "SELECT_SETTLEMENT", settlementEntityId: number }
    | { type: "CONFIRM" }
    | { type: "ABORT" }


export const CreateTileImprovementInteraction = createInteractionDefinition<
    CreateTileImprovementInteractionState,
    CreateTileImprovementInteractionEvent,
    CreateTileImprovementInteractionContext,
    CreateTileImprovementInteractionInput
>({
    initialState: () => "Prepare",
    initialContext: input => ({
        position: input.position,
        availableSettlementEntityIds: [],
        settlementEntityId: null,
        createTileImprovementWindowId: null,
    }),
    states: {

        Prepare: {
            onEnter: async ({context}) => {
                const availableSettlements = selectAvailableAdministeringSettlements(context.position);
                return {
                    context: {
                        availableSettlementEntityIds: availableSettlements.map(it => it.id),
                        settlementEntityId: chooseDefaultAdministeringSettlement(availableSettlements),
                    },
                    event: {type: "PREPARATION_DONE"},
                };
            },
            PREPARATION_DONE: {
                target: "ConfiguringTileImprovement",
            },
        },

        ConfiguringTileImprovement: {
            onEnter: ({event}) => {
                if (event.type === "PREPARATION_DONE") {
                    const windowId = openWindowCreateTileImprovement();
                    return {createTileImprovementWindowId: windowId};
                }
            },
            SELECT_SETTLEMENT: {
                target: "ConfiguringTileImprovement",
                action: ({event}) => ({settlementEntityId: event.settlementEntityId}),
            },
            CONFIRM: {
                guard: ({context}) => !!context.settlementEntityId,
                target: "Finalizing",
            },
            ABORT: {
                target: "Aborted",
            },
        },

        PickingSettlement: {
            onEnter: () => {

            },
            onExit: () => {

            },
        },

        Finalizing: {
            terminal: true,
            onEnter: ({context}) => {
                if (context.createTileImprovementWindowId) {
                    closeWindow(context.createTileImprovementWindowId);
                }
                DI.commandDatabase.insert({
                    type: "create-tile-improvement",
                    id: genCommandId(),
                    location: context.position,
                    settlementEntityId: context.settlementEntityId ?? -1,
                });
                gameAudio.WRITING_ON_PAPER.play();
            },
        },

        Aborted: {
            terminal: true,
            onEnter: ({context}) => {
                if (context.createTileImprovementWindowId) {
                    closeWindow(context.createTileImprovementWindowId);
                }
            },
        },

    },
});

function selectAvailableAdministeringSettlements(position: HexPosition): { id: number, amount: number }[] {
    const tile = DI.tileDatabase.querySingle(TileQueries.BY_POSITION, position);
    if (!tile) {
        return [];
    }
    if (!tile.political.visible) {
        return [];
    }

    const playerRealm = DI.realmDatabase.querySingle(RealmQueries.OWNED, undefined);
    if (!playerRealm) {
        return [];
    }

    const groupedSettlements = tile.political.value.control
        .filter(it => it.realm === playerRealm.id && it.amount > 0 && it.settlement !== null)
        .reduce(
            (acc, current) => {
                const settlementId = current.settlement as number;
                const existing = acc.get(settlementId) || 0;
                acc.set(settlementId, existing + current.amount);
                return acc;
            },
            new Map<number, number>(),
        );

    return Array.from(groupedSettlements, ([id, amount]) => ({id: id, amount: amount}));
}

function chooseDefaultAdministeringSettlement(available: { id: number, amount: number }[]): number {
    if (!available) {
        throw new Error("no available settlements");
    }
    let best = available[0];
    available.forEach(it => {
        if (it.amount > best.amount) {
            best = it;
        }
    });

    return best.id;
}