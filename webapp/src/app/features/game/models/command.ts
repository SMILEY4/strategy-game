import type {HexPosition} from "@app/features/game/models/hex-position.ts";

export interface CommandBase {
    id: string,
    type: string;
}

export type Command =
    | CommandFoundCapital

export interface CommandFoundCapital extends CommandBase {
    id: string,
    type: "found-capital";
    location: HexPosition;
}

export function genCommandId() {
    return crypto.randomUUID();
}