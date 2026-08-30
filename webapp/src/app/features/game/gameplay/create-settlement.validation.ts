import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {type CommandDatabase, CommandQueries} from "@app/features/game/database/command.database.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import {useWatchDatabases} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import {useHasInteraction} from "@modules/interaction/interaction.tools.ts";
import {type EntityDatabase, EntityQueries} from "@app/features/game/database/entity.database.ts";
import {EntityUtils} from "@app/features/game/models/entity.ts";

export interface CreateSettlementValidation {

    availableFirst: (args: {
        entityDb: EntityDatabase
    }) => boolean;

    validateFirst: (args: {
        position: HexPosition,
        hasInteraction: boolean,
        commandDb: CommandDatabase,
        tileDb: TileDatabase
    }) => boolean;

    available: (args: {
        entityDb: EntityDatabase
    }) => boolean;

    validate: (args: { position: HexPosition, hasInteraction: boolean, commandDb: CommandDatabase, tileDb: TileDatabase }) => boolean;
}


export const createSettlementValidation = (): CreateSettlementValidation => ({

    availableFirst: (args) => {

        const {entityDb} = args;

        // check spawn entity exists
        const entities = entityDb.queryMany(EntityQueries.ALL, undefined);
        const spawnEntity = entities.find(it => EntityUtils.hasComponent(it, "player-spawn"));
        if (!spawnEntity || EntityUtils.getComponentOrThrow(spawnEntity, "player-spawn").foundedFirstSettlement) {
            return false;
        }

        return true;
    },

    validateFirst: (args) => {

        const {hasInteraction, commandDb, tileDb, position} = args;

        // check active interactions
        const validInteraction = !hasInteraction;
        if (!validInteraction) {
            return false;
        }

        // check base game state
        const tile = tileDb.querySingle(TileQueries.BY_POSITION, position);
        const validGameState = !!tile && tile.createSettlement.firstAvailable && tile.createSettlement.firstAllowed;
        if (!validGameState) {
            return false;
        }
        // check current commands -> no settlement already created anywhere this turn
        const commandsValid = commandDb.queryMany(CommandQueries.BY_TYPE, "create-settlement").length === 0;
        if (!commandsValid) {
            return false;
        }

        return true;
    },

    available: (args) => {

        const {entityDb} = args;

        // check spawn entity exists but was used to found realm
        const entities = entityDb.queryMany(EntityQueries.ALL, undefined);
        const spawnEntity = entities.find(it => EntityUtils.hasComponent(it, "player-spawn"));
        if (spawnEntity && !EntityUtils.getComponentOrThrow(spawnEntity, "player-spawn").foundedFirstSettlement) {
            return false;
        }

        return true;
    },

    validate: (args) => {

        const {hasInteraction, commandDb, tileDb, position} = args;

        // check active interactions
        const validInteraction = !hasInteraction;
        if (!validInteraction) {
            return false;
        }

        // check base game state
        const tile = tileDb.querySingle(TileQueries.BY_POSITION, position);
        const validGameState = !!tile && tile.createSettlement.available && tile.createSettlement.allowed;
        if (!validGameState) {
            return false;
        }

        // check current commands -> no settlement created on same location
        const commandsValid = commandDb
            .queryMany(CommandQueries.BY_TYPE, "create-settlement")
            .filter(cmd => cmd.type === "create-settlement" && cmd.location.q == position.q && cmd.location.r == position.r).length === 0;
        if (!commandsValid) {
            return false;
        }

        return true;
    },

});

export function useCreateSettlementValidation() {

    useWatchDatabases([
        DI.tileDatabase,
        DI.commandDatabase,
        DI.entityDatabase,
    ]);

    const hasInteraction = useHasInteraction();

    return {
        settlementAvailable: () => DI.createSettlementValidation.available({
            entityDb: DI.entityDatabase,
        }),
        settlement: (position: HexPosition) => DI.createSettlementValidation.validate({
            position: position,
            tileDb: DI.tileDatabase,
            commandDb: DI.commandDatabase,
            hasInteraction: hasInteraction,
        }),
        firstSettlementAvailable: () => DI.createSettlementValidation.availableFirst({
            entityDb: DI.entityDatabase,
        }),
        firstSettlement: (position: HexPosition) => DI.createSettlementValidation.validateFirst({
            position: position,
            tileDb: DI.tileDatabase,
            commandDb: DI.commandDatabase,
            hasInteraction: hasInteraction,
        }),
    };
}