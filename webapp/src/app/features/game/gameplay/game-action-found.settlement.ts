import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import type {RevisionDatabase} from "@modules/gamedb/adapters/use-database.ts";

export interface GameActionFoundSettlement {
    getRelevantDatabases: () => RevisionDatabase[],
    validate: (position: HexPosition) => boolean;
}

export const gameActionFoundSettlement = (): GameActionFoundSettlement => ({

    getRelevantDatabases: () => [],

    validate: (_position: HexPosition) => {
        return true;
    },


});