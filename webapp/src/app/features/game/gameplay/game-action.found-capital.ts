import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import type {CommandDatabase} from "@app/features/game/database/command.database.ts";
import {genCommandId} from "@app/features/game/models/command.ts";
import {gameAudio} from "@app/audio/gameAudio.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";

export interface GameActionFoundCapital {
    validate: (pos: HexPosition) => boolean;
    execute: (pos: HexPosition) => void;
}

interface Dependencies {
    commandDb: CommandDatabase;
    tileDb: TileDatabase,
}

export const gameActionFoundCapital = ({commandDb, tileDb}: Dependencies): GameActionFoundCapital => ({

    validate: (pos: HexPosition) => {
        const tile = tileDb.querySingle(TileQueries.BY_POSITION, pos);
        if (!tile) {
            return false;
        }
        if(!tile.createSettlement.allowed) {
            return false
        }
        return true;
    },

    execute: (pos: HexPosition) => {
        commandDb.insert({
            type: "found-capital",
            id: genCommandId(),
            location: pos,
        });
        gameAudio.WRITING_ON_PAPER.play();
    },

});