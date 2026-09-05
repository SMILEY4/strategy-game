import type {ExtendedHexPosition} from "@app/features/game/models/hex-position.ts";

export interface CommandBase {
    id: string,
    type: string;
}

export type Command =
    | CommandCreateSettlement

export interface CommandCreateSettlement extends CommandBase {
    id: string,
    type: "create-settlement";
    location: ExtendedHexPosition;
    name: string,
}

export function genCommandId() {
    return crypto.randomUUID();
}