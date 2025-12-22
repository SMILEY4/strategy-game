import {Command} from "../command/command";

export type CommandMessage =
    | CommandMessage.Move
    | CommandMessage.Disband
    | CommandMessage.ConstructTileImprovement

export namespace CommandMessage {

    export interface Move {
        type: "world-object-move"
        worldObjectId: string,
        path: ({
            id: string,
            position: {
                q: number,
                r: number
            }
        })[]
    }

    export interface Disband {
        type: "world-object-disband",
        worldObjectId: string,
    }

    export interface ConstructTileImprovement {
        type: "world-object-construct-improvement";
        worldObjectId: string;
        improvementType: string;
    }

    export interface CreateSettlement {
        type: "world-object-spawn-settlement";
        worldObjectId: string;
        tile: {
            id: string,
            position: {
                q: number,
                r: number
            }
        };
        settlementName: string;
    }

    export interface AddProductionQueueItem {
        type: "world-object-add-production-queue-item";
        worldObjectId: string;
        item: string;
    }

    type CommandMessageMapping = {
        [Command.Type.Move]: CommandMessage.Move;
        [Command.Type.Disband]: CommandMessage.Disband;
        [Command.Type.ConstructTileImprovement]: CommandMessage.ConstructTileImprovement;
        [Command.Type.CreateSettlement]: CommandMessage.CreateSettlement;
        [Command.Type.AddProductionQueueItem]: CommandMessage.AddProductionQueueItem;
    };

    const mapping: {
        [K in Command.Type]: (command: Extract<Command, { type: K }>) => CommandMessageMapping[K]
    } = {
        [Command.Type.Move]: (cmd) => ({
            type: "world-object-move",
            worldObjectId: cmd.worldObjectId,
            path: cmd.path.map(it => ({
                id: it.id,
                position: {
                    q: it.position.q,
                    r: it.position.r,
                },
            })),
        }),
        [Command.Type.Disband]: (cmd) => ({
            type: "world-object-disband",
            worldObjectId: cmd.worldObjectId,
        }),
        [Command.Type.ConstructTileImprovement]: (cmd) => ({
            type: "world-object-construct-improvement",
            worldObjectId: cmd.worldObjectId,
            improvementType: cmd.tileImprovementType,
        }),
        [Command.Type.CreateSettlement]: (cmd) => ({
            type: "world-object-spawn-settlement",
            worldObjectId: cmd.worldObjectId,
            settlementName: cmd.name,
            tile: cmd.tile,
        }),
        [Command.Type.AddProductionQueueItem]: (cmd) => ({
            type: "world-object-add-production-queue-item",
            worldObjectId: cmd.worldObjectId,
            item: cmd.item,
        }),
    };

    export function map<K extends Command.Type>(command: Extract<Command, { type: K }>): CommandMessageMapping[K] {
        return mapping[command.type](command as any);
    }

}
