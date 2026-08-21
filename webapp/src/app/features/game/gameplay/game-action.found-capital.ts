import type {ExtendedHexPosition, HexPosition} from "@app/features/game/models/hex-position.ts";
import {type CommandDatabase, CommandQueries} from "@app/features/game/database/command.database.ts";
import {genCommandId} from "@app/features/game/models/command.ts";
import {gameAudio} from "@app/audio/gameAudio.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import type {GameClient} from "@app/features/game/game.client.ts";
import {getParameterGameId} from "@pages/routing.tsx";
import type {RevisionDatabase} from "@modules/gamedb/adapters/use-database.ts";

export interface GameActionFoundCapital {
    getRelevantDatabases: () => RevisionDatabase[],
    validate: (pos: HexPosition) => boolean;
    execute: (pos: ExtendedHexPosition) => Promise<void>;
}

interface Dependencies {
    commandDb: CommandDatabase;
    tileDb: TileDatabase,
    gameClient: GameClient
}

export const gameActionFoundCapital = ({commandDb, tileDb, gameClient}: Dependencies): GameActionFoundCapital => ({

    getRelevantDatabases: () => [commandDb, tileDb],

    validate: (pos: HexPosition) => {
        const tile = tileDb.querySingle(TileQueries.BY_POSITION, pos);
        if (!tile) {
            return false;
        }
        if(!tile.createCapital.allowed) {
            return false
        }
        if(commandDb.queryMany(CommandQueries.BY_TYPE, "found-capital").length > 0) {
            return false
        }
        return true;
    },

    execute: async (pos: ExtendedHexPosition) => {
        const gameId = getParameterGameId();
        const settlementName = await gameClient.getSettlementName(gameId)
        commandDb.insert({
            type: "found-capital",
            id: genCommandId(),
            location: pos,
            name: settlementName
        });
        gameAudio.WRITING_ON_PAPER.play();
    },

});