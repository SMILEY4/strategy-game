import {TileSummary} from "../../../models/tile/tileSummary";
import {InteractionDefinition} from "../../../common/interactions/interaction.definition";
import {WorldObject} from "../../../models/worldobject/worldObject";
import {Tile} from "../../../models/tile/tile";
import {HexUtils} from "../../../common/hexUtils";
import {GameClient} from "../game.client";
import {WorldObjectDatabase} from "../../database/worldObjectDatabase";
import {CommandService} from "../command/command.service";
import {Command} from "../../../models/command/command";
import {TileDatabase} from "../../database/tileDatabase";
import {Db} from "../../database";

export type SettlementCreateInteractionEvent =
    | { eventId: "SELECT_TILE", tile: TileSummary }
    | { eventId: "SELECT_NAME", name: string }
    | { eventId: "SELECT_RANDOM_NAME" }
    | { eventId: "CONFIRM" }
    | { eventId: "CANCEL" };


type SettlementCreateInteractionState =
    | "AWAIT_SELECTION"
    | "COMPLETED"

export interface SettlementCreateInteractionContext {
    worldObjectId: WorldObject.Id,
    validTiles: TileSummary[];
    tile: TileSummary | null;
    name: string | null;
}


export const settlementCreateInteractionDefinition: InteractionDefinition<
    SettlementCreateInteractionState,
    SettlementCreateInteractionEvent,
    SettlementCreateInteractionContext
> = {
    id: "settlement.create",
    initial: "AWAIT_SELECTION",
    onStart: async ({getCtx, setCtx}) => {
        const {worldObjectId} = getCtx();
        const worldObject = Db.worldObject.querySingle(WorldObjectDatabase.QUERY_BY_ID, worldObjectId);
        if (!worldObject) {
            throw new Error("Could not find world object for given id.");
        }
        const name = await getRandomName();
        setCtx(prev => ({
            ...prev,
            validTiles: getValidTiles(worldObject.tile.position),
            name: name,
        }));
    },
    states: {
        AWAIT_SELECTION: {
            transitions: {
                SELECT_TILE: {
                    target: "AWAIT_SELECTION",
                    condition: ({event, getCtx}) => {
                        const context = getCtx();
                        return context.validTiles.map(it => it.id).includes(event.tile.id);
                    },
                    action: ({event, setCtx}) => {
                        setCtx((prev) => ({
                            ...prev,
                            tile: event.tile,
                        }));
                    },
                },
                SELECT_NAME: {
                    target: "AWAIT_SELECTION",
                    action: ({event, setCtx}) => {
                        setCtx((prev) => ({
                            ...prev,
                            name: event.name,
                        }));
                    },
                },
                SELECT_RANDOM_NAME: {
                    target: "AWAIT_SELECTION",
                    action: async ({setCtx}) => {
                        const name = await getRandomName();
                        setCtx((prev) => ({
                            ...prev,
                            name: name,
                        }));
                    },
                },
                CONFIRM: {
                    target: "COMPLETED",
                    condition: ({getCtx}) => {
                        const {tile, name} = getCtx();
                        return !!(tile && name?.trim());
                    },
                    action: ({getCtx}) => {
                        const {worldObjectId, name, tile} = getCtx();
                        CommandService.addCommand({
                            type: Command.Type.CreateSettlement,
                            id: Command.genId(),
                            worldObjectId: worldObjectId,
                            name: name!,
                            tile: tile!,
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

function getRandomName(): Promise<string> {
    return GameClient.getRandomSettlementName()
        .catch(() => {
            console.warn("Could not fetch random settlement name");
            return "";
        });
}

function getValidTiles(tile: Tile.Position): TileSummary[] {
    return HexUtils.getPositionsRadius(tile.q, tile.r, 1)
        .map(position => Db.tile.querySingle(TileDatabase.QUERY_BY_POSITION, [position.q, position.r]))
        .filter(it => it != null) as TileSummary[];
}