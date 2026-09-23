import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {type CommandDatabase, CommandQueries} from "@app/features/game/database/command.database.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import {useWatchDatabases} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import {useHasInteraction} from "@modules/interaction/interaction.tools.ts";
import {RealmQueries, type RealmDatabase} from "@app/features/game/database/realm.database.ts";

export interface CreateSettlementValidation {
    validate: (args: {
        position: HexPosition,
        hasInteraction: boolean,
        commandDb: CommandDatabase,
        tileDb: TileDatabase,
        realmDb: RealmDatabase,
    }) => boolean;
}

export const createSettlementValidation = (): CreateSettlementValidation => ({
    validate: ({hasInteraction, commandDb, tileDb, realmDb, position}) => {
        if (hasInteraction) return false;

        // check: tile exists and can create settlement (backend validation)
        const tile = tileDb.querySingle(TileQueries.BY_POSITION, position);
        if (!tile || !tile.createSettlement.visible || !tile.createSettlement.value.validLocation || !tile.createSettlement.value.validRealm) {
            return false;
        }

        // check: other pending "create tile improvement" commands allow new settlement
        const createTileImprovementCommands = commandDb.queryMany(CommandQueries.BY_TYPE, "create-tile-improvement");
        if(createTileImprovementCommands.some(cmd => cmd.location.q === position.q || cmd.location.r === position.r)) {
            return false
        }

        // check: other pending "create settlement" commands allow new settlement
        const createSettlementCommands = commandDb.queryMany(CommandQueries.BY_TYPE, "create-settlement");
        return realmDb.querySingle(RealmQueries.OWNED, undefined)?.phase === "FOUNDING"
            ? createSettlementCommands.length === 0
            : createSettlementCommands.every(cmd => cmd.location.q !== position.q || cmd.location.r !== position.r);
    },
});

export function useCreateSettlementValidation() {
    useWatchDatabases([
        DI.tileDatabase,
        DI.commandDatabase,
        DI.realmDatabase,
    ]);

    const hasInteraction = useHasInteraction();

    return {
        settlement: (position: HexPosition) => DI.createSettlementValidation.validate({
            position,
            tileDb: DI.tileDatabase,
            commandDb: DI.commandDatabase,
            realmDb: DI.realmDatabase,
            hasInteraction,
        }),
    };
}
