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
        const validGameState = !!tile && tile.createCapital.allowed;
        if (!validGameState) {
            return false;
        }
        // check current commands
        const validCommands = commandDb.queryMany(CommandQueries.BY_TYPE, "found-capital").length === 0;
        if (!validCommands) {
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
        const validGameState = !!tile && tile.createCapital.allowed; // todo: adapt parameter
        if (!validGameState) {
            return false;
        }
        // check current commands
        const validCommands = commandDb.queryMany(CommandQueries.BY_TYPE, "found-capital").length === 0; // todo: adapt type
        if (!validCommands) {
            return false;
        }

        return true;
    },

});

export function useCreateSettlementValidation() {

    useWatchDatabases([
        DI.tileDatabase,
        DI.commandDatabase,
        DI.entityDatabase
    ]);

    const hasInteraction = useHasInteraction();

    return {
        settlement: (position: HexPosition) => DI.createSettlementValidation.validate({
            position: position,
            tileDb: DI.tileDatabase,
            commandDb: DI.commandDatabase,
            hasInteraction: hasInteraction,
        }),
        firstSettlement: (position: HexPosition) => DI.createSettlementValidation.validateFirst({
            position: position,
            tileDb: DI.tileDatabase,
            commandDb: DI.commandDatabase,
            hasInteraction: hasInteraction,
        }),
        firstSettlementAvailable: () => DI.createSettlementValidation.availableFirst({
            entityDb: DI.entityDatabase,
        }),
    };
}