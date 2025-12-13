import {InteractionDefinition} from "../../../common/interactions/interaction.definition";
import {TileSummary} from "../../../models/tile/tileSummary";
import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {MovementTarget} from "../../../models/misc/movementTarget";
import {GameClient} from "../game.client";
import {CommandService} from "../command/game.command.service";
import {Command} from "../../../models/command/command";

export type WorldObjectMoveInteractionEvent =
    | { eventId: "SELECT_TILE", tile: TileSummary }
    | { eventId: "TARGETS_READY", targets: MovementTarget[] }
    | { eventId: "CONFIRM" }
    | { eventId: "CANCEL" };


type WorldObjectMoveInteractionState =
    | "AWAIT_TARGETS"
    | "AWAIT_SELECTION"
    | "COMPLETED"

export interface WorldObjectMoveInteractionContext {
    worldObject: WorldObjectSummary,
    path: TileSummary[],
    targets: MovementTarget[],
}

export const worldObjectMoveInteractionDefinition: InteractionDefinition<
    WorldObjectMoveInteractionState,
    WorldObjectMoveInteractionEvent,
    WorldObjectMoveInteractionContext
> = {
    id: "worldobject.move",
    initial: "AWAIT_TARGETS",
    states: {
        AWAIT_TARGETS: {
            onEnter: ({dispatch, getCtx}) => {
                const context = getCtx();
                const pathHead = getPathHead(context);
                const pathCost = getPathCost(context);
                GameClient
                    .getAvailableMovementPositions(context.worldObject.id, pathHead.id, pathCost)
                    .then(targets => {
                        dispatch({eventId: "TARGETS_READY", targets: targets});
                    })
                    .catch(error => {
                        console.warn("Could not load available movement targets", error);
                        dispatch({eventId: "TARGETS_READY", targets: []});
                    });
            },
            transitions: {
                TARGETS_READY: {
                    target: "AWAIT_SELECTION",
                    action: ({event, setCtx}) => {
                        setCtx(prev => ({
                            ...prev,
                            targets: event.targets,
                        }));
                    },
                },
            },
        },
        AWAIT_SELECTION: {
            transitions: {
                SELECT_TILE: {
                    // todo: validate selected tile
                    target: "AWAIT_TARGETS",
                    action: ({event, setCtx}) => {
                        setCtx(prev => ({
                            ...prev,
                            path: [...prev.path, event.tile],
                        }));
                    },
                },
                CONFIRM: {
                    // todo: validate path
                    target: "COMPLETED",
                    action: ({getCtx}) => {
                        const {worldObject, path} = getCtx();
                        CommandService.addCommand({
                            type: Command.Type.Move,
                            id: Command.genId(),
                            worldObjectId: worldObject.id,
                            path: path,
                        });
                    },
                },
                CANCEL: {
                    target: "COMPLETED",
                },
            },
        },
        COMPLETED: {
            end: true,
            transitions: {},
        },
    },
};

function getPathHead(context: WorldObjectMoveInteractionContext): TileSummary {
    return context.path[context.path.length - 1];
}

function getPathCost(context: WorldObjectMoveInteractionContext): number {
    return context.path.length;
}