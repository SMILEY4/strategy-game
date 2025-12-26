import {Command} from "../command/command";

export type CommandMessage =
    | CommandMessage.Move
    | CommandMessage.Disband
    | CommandMessage.ConstructTileImprovement

export namespace CommandMessage {

    export interface Move {
        commandType: "move"
        worldObject: string,
        path: ({
            id: string,
            q: number,
            r: number
        })[]
    }

    export interface Disband {
        commandType: "disband",
        worldObject: string,
    }

    export interface ConstructTileImprovement {
        commandType: "construct-tile-improvement";
        worldObject: string;
        improvement: string;
    }

    export interface CreateSettlement {
        commandType: "construct-settlement";
        worldObject: string;
        tile: {
            id: string,
            q: number,
            r: number
        };
        settlementName: string;
    }

    export interface AddProductionQueueItem {
        commandType: "add-production-queue-item";
        worldObject: string;
        item: "worker" | "scout";
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
            commandType: "move",
            worldObject: cmd.worldObjectId,
            path: cmd.path.map(it => ({
                id: it.id,
                    q: it.position.q,
                    r: it.position.r,
            })),
        }),
        [Command.Type.Disband]: (cmd) => ({
            commandType: "disband",
            worldObject: cmd.worldObjectId,
        }),
        [Command.Type.ConstructTileImprovement]: (cmd) => ({
            commandType: "construct-tile-improvement",
            worldObject: cmd.worldObjectId,
            improvement: cmd.tileImprovementType,
        }),
        [Command.Type.CreateSettlement]: (cmd) => ({
            commandType: "construct-settlement",
            worldObject: cmd.worldObjectId,
            settlementName: cmd.name,
            tile: {
                id: cmd.tile.id,
                q: cmd.tile.position.q,
                r: cmd.tile.position.r,
            },
        }),
        [Command.Type.AddProductionQueueItem]: (cmd) => ({
            commandType: "add-production-queue-item",
            worldObject: cmd.worldObjectId,
            item: cmd.item,
        }),
    };

    export function map<K extends Command.Type>(command: Extract<Command, { type: K }>): CommandMessageMapping[K] {
        return mapping[command.type](command as any);
    }

}
