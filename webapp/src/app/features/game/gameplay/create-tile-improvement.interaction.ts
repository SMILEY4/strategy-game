import {createInteractionDefinition} from "@modules/interaction/interaction.definition.ts";
import type {ExtendedHexPosition, HexPosition} from "@app/features/game/models/hex-position.ts";
import {closeWindow} from "@modules/uicomponents/window/useWindow.ts";
import {gameAudio} from "@app/audio/gameAudio.ts";
import {DI} from "@app/app.ts";
import {genCommandId} from "@app/features/game/models/command.ts";
import {openWindowCreateTileImprovement} from "@pages/game/gameui/tileimprovement/create/CreateTileImprovementWindow.tsx";
import {TileQueries} from "@app/features/game/database/tile.database.ts";
import {RealmQueries} from "@app/features/game/database/realm.database.ts";
import {type EntityDatabase, EntityQueries} from "@app/features/game/database/entity.database.ts";
import {type Entity, EntityUtils} from "@app/features/game/models/entity.ts";

interface CreateTileImprovementInteractionInput {
    position: ExtendedHexPosition;
}

interface CreateTileImprovementInteractionContext {
    position: ExtendedHexPosition,
    availableSettlementEntityIds: number[],
    settlementEntityId: number | null
    availableImprovementKeys: string[],
    improvementKey: string | null,
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
    | { type: "SELECT_IMPROVEMENT", improvementKey: string }
    | { type: "CONFIRM" }
    | { type: "ABORT" }
    | { type: "CLICK_TILE", position: HexPosition }


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
        availableImprovementKeys: [],
        improvementKey: null,
        createTileImprovementWindowId: null,
    }),
    states: {

        Prepare: {
            onEnter: async ({context}) => {
                const availableSettlements = selectAvailableAdministeringSettlements(context.position);
                const availableImprovementKeys = selectAvailableImprovementKeys(context.position);
                return {
                    context: {
                        availableSettlementEntityIds: availableSettlements.map(it => it.id),
                        settlementEntityId: chooseDefaultAdministeringSettlement(availableSettlements),
                        availableImprovementKeys,
                        improvementKey: availableImprovementKeys[0] ?? null,
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
            PICK_SETTLEMENT: {
                target: "PickingSettlement",
            },
            SELECT_IMPROVEMENT: {
                target: "ConfiguringTileImprovement",
                action: ({event}) => ({improvementKey: event.improvementKey}),
            },
            CONFIRM: {
                guard: ({context}) => !!context.settlementEntityId && !!context.improvementKey,
                target: "Finalizing",
            },
            ABORT: {
                target: "Aborted",
            },
        },

        PickingSettlement: {
            CLICK_TILE: {
                target: "ConfiguringTileImprovement",
                guard: ({event, context}) => {
                    return getValidSettlementAtLocation(DI.entityDatabase, event.position, context.availableSettlementEntityIds) != null;
                },
                action: ({event, context}) => {
                    const settlement = getValidSettlementAtLocation(DI.entityDatabase, event.position, context.availableSettlementEntityIds);
                    if (settlement) {
                        gameAudio.CLICK_PRIMARY.play();
                        return {settlementEntityId: settlement.id};
                    } else {
                        return;
                    }
                },
            },
            ABORT: {
                target: "Aborted",
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
                    improvementKey: context.improvementKey ?? "",
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
    if (!available || available.length === 0) {
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

function selectAvailableImprovementKeys(position: HexPosition): string[] {
    const tile = DI.tileDatabase.querySingle(TileQueries.BY_POSITION, position);
    if (!tile?.createTileImprovement.visible) return [];
    return tile.createTileImprovement.value.availableImprovementKeys;
}

function getValidSettlementAtLocation(db: EntityDatabase, position: HexPosition, validIds: number[]): Entity | null {
    const entitiesAtLocation = db.queryMany(EntityQueries.BY_POSITION, position);
    const settlement = entitiesAtLocation.find(entity => EntityUtils.hasComponent(entity, "settlement"));
    if (settlement && validIds.includes(settlement.id)) {
        return settlement;
    } else {
        return null;
    }
}