import {InteractionDefinition} from "../../../common/interactions/interaction.definition";
import {TileSummary} from "../../../models/tile/tileSummary";
import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {GameClient} from "../service/gameClient";
import {CommandService} from "../service/commandService";
import {Command} from "../../../models/command/command";

type MoveUnitInteractionEvent =
    | { eventId: "TARGETS_READY", targets: TileSummary[] }
    | { eventId: "CLICK_TILE", tile: TileSummary }
    | { eventId: "CONFIRM_MOVE" }

type MoveUnitInteractionState =
    | "AWAIT_TARGETS"
    | "AWAIT_SELECTION"
    | "COMPLETED"

interface MoveUnitInteractionContext {
    unit: WorldObjectSummary,
    path: TileSummary[];
    availableTargets: TileSummary[];
}

const gameClient: GameClient = null as any; // todo
const commandService: CommandService = null as any; // todo

const MoveUnitInteractionDefinition: InteractionDefinition<MoveUnitInteractionState, MoveUnitInteractionEvent, MoveUnitInteractionContext> = {
    id: "move-unit",
    initial: "AWAIT_TARGETS",
    states: {
        AWAIT_TARGETS: {
            onEnter: ({getCtx, dispatch}) => {
                const context = getCtx();
                const currentPathHead = context.path[context.path.length - 1] ?? context.unit.tile;
                const currentPathCost = (context.path.length - 1);
                try {
                    gameClient
                        .getAvailableMovementPositions(context.unit.id, currentPathHead.id, currentPathCost)
                        .then(targets => targets.map(it => it.tile))
                        .then(targets => dispatch({eventId: "TARGETS_READY", targets: targets}));
                } catch (e) {
                    console.warn("Error fetching movement targets", e)
                    dispatch({eventId: "TARGETS_READY", targets: []});
                }
            },
            transitions: {
                TARGETS_READY: {
                    action: ({event, setCtx}) => {
                        setCtx(context => ({
                            ...context,
                            availableTargets: event.targets,
                        }));
                    },
                    target: "AWAIT_SELECTION",
                },
            },
        },
        AWAIT_SELECTION: {
            transitions: {
                CLICK_TILE: {
                    action: ({event, setCtx}) => {
                        setCtx(context => ({
                            ...context,
                            path: [...context.path, event.tile],
                        }));
                    },
                    target: "AWAIT_TARGETS",
                },
                CONFIRM_MOVE: {
                    target: "COMPLETED",
                },
            },
        },
        COMPLETED: {
            end: true,
            onEnter: ({ getCtx }) => {
                const context = getCtx();
                commandService.addCommand({
                    type: Command.Type.Move,
                    id: Command.genId(),
                    worldObjectId: context.unit.id,
                    path: context.path,
                });
            },
            transitions: {},
        },
    },
};