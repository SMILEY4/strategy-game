import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {type CommandDatabase, CommandQueries} from "@app/features/game/database/command.database.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import {useWatchDatabases} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import {useHasInteraction} from "@modules/interaction/interaction.tools.ts";
import {type RealmDatabase, RealmQueries} from "@app/features/game/database/realm.database.ts";

export interface CreateTileImprovementValidation {
    validate: (args: {
        position: HexPosition,
        hasInteraction: boolean,
        commandDb: CommandDatabase,
        tileDb: TileDatabase,
        realmDb: RealmDatabase,
    }) => boolean;
}

export const createTileImprovementValidation = (): CreateTileImprovementValidation => ({
    validate: ({hasInteraction, commandDb, tileDb, realmDb, position}) => {
        if (hasInteraction) return false;

        const tile = tileDb.querySingle(TileQueries.BY_POSITION, position);
        if (!tile || !tile.createTileImprovement.visible || !tile.createTileImprovement.value.validLocation || !tile.createTileImprovement.value.validRealm) {
            return false;
        }

        const realm = realmDb.querySingle(RealmQueries.OWNED, undefined);
        if (!realm) return false;

        const createTileImprovementCommands = commandDb.queryMany(CommandQueries.BY_TYPE, "create-tile-improvement");
        if (createTileImprovementCommands.some(cmd => cmd.location.q === position.q || cmd.location.r === position.r)) {
            return false;
        }

        const createSettlementCommands = commandDb.queryMany(CommandQueries.BY_TYPE, "create-settlement");
        if (createSettlementCommands.some(cmd => cmd.location.q === position.q || cmd.location.r === position.r)) {
            return false;
        }

        return true;
    },
});

export function useCreateTileImprovementValidation() {
    useWatchDatabases([
        DI.tileDatabase,
        DI.commandDatabase,
        DI.realmDatabase,
    ]);

    const hasInteraction = useHasInteraction();

    return {
        tileImprovement: (position: HexPosition) => DI.createTileImprovementValidation.validate({
            position,
            tileDb: DI.tileDatabase,
            commandDb: DI.commandDatabase,
            realmDb: DI.realmDatabase,
            hasInteraction,
        }),
    };
}
