import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {type CommandDatabase, CommandQueries} from "@app/features/game/database/command.database.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import {useWatchDatabases} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import {useHasInteraction} from "@modules/interaction/interaction.tools.ts";

export interface CreateSettlementValidation {
    validate: (args: {
        position: HexPosition,
        hasInteraction: boolean,
        commandDb: CommandDatabase,
        tileDb: TileDatabase
    }) => boolean;
}

export const createSettlementValidation = (): CreateSettlementValidation => ({
    validate: ({hasInteraction, commandDb, tileDb, position}) => {
        if (hasInteraction) return false;

        const tile = tileDb.querySingle(TileQueries.BY_POSITION, position);
        if (!tile || !tile.createSettlement.validLocation || !tile.createSettlement.validRealm) {
            return false;
        }

        const commands = commandDb.queryMany(CommandQueries.BY_TYPE, "create-settlement");
        return tile.createSettlement.phase === "FOUNDING"
            ? commands.length === 0
            : commands.every(cmd => cmd.location.q !== position.q || cmd.location.r !== position.r);
    },
});

export function useCreateSettlementValidation() {
    useWatchDatabases([
        DI.tileDatabase,
        DI.commandDatabase,
    ]);

    const hasInteraction = useHasInteraction();

    return {
        settlement: (position: HexPosition) => DI.createSettlementValidation.validate({
            position,
            tileDb: DI.tileDatabase,
            commandDb: DI.commandDatabase,
            hasInteraction,
        }),
    };
}
