import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";

export interface CommandBase {
    id: string,
    type: string;
}

export type Command =
    | CommandCreateSettlement
    | CommandCreateTileImprovement

export interface CommandCreateSettlement extends CommandBase {
    id: string,
    type: "create-settlement";
    location: ExtendedHexPosition;
    name: string,
}

export interface CommandCreateTileImprovement extends CommandBase {
    id: string,
    type: "create-tile-improvement";
    location: ExtendedHexPosition;
    settlementEntityId: number,
    improvementKey: string,
}

export function genCommandId() {
    return crypto.randomUUID();
}
