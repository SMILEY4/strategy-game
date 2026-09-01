import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import {type CommandDatabase, CommandQueries} from "@app/features/game/database/command.database.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import {useWatchDatabases} from "@modules/gamedb/adapters/use-database.ts";
import {DI} from "@app/app.ts";
import {useHasInteraction} from "@modules/interaction/interaction.tools.ts";
import {type EntityDatabase, EntityQueries} from "@app/features/game/database/entity.database.ts";
import {EntityUtils} from "@app/features/game/models/entity.ts";

export interface CreateSettlementValidation {

    availableFounding: (args: {
        entityDb: EntityDatabase
    }) => boolean;

    validateFounding: (args: {
        position: HexPosition,
        hasInteraction: boolean,
        commandDb: CommandDatabase,
        tileDb: TileDatabase
    }) => boolean;

    availableEstablished: (args: {
        entityDb: EntityDatabase
    }) => boolean;

    validateEstablished: (args: { position: HexPosition, hasInteraction: boolean, commandDb: CommandDatabase, tileDb: TileDatabase }) => boolean;
}


export const createSettlementValidation = (): CreateSettlementValidation => ({

    availableFounding: (args) => {

        const {entityDb} = args;

        // check spawn entity exists
        const entities = entityDb.queryMany(EntityQueries.ALL, undefined);
        const spawnEntity = entities.find(it => EntityUtils.hasComponent(it, "player-spawn"));
        if (!spawnEntity || EntityUtils.getComponentOrThrow(spawnEntity, "player-spawn").hasSettlement) {
            return false;
        }

        return true;
    },

    validateFounding: (args) => {

        const {hasInteraction, commandDb, tileDb, position} = args;

        // check active interactions
        const validInteraction = !hasInteraction;
        if (!validInteraction) {
            return false;
        }

        // check base game state
        const tile = tileDb.querySingle(TileQueries.BY_POSITION, position);
        const validGameState = !!tile && tile.createSettlement.phase === "FOUNDING" && tile.createSettlement.validLocation && tile.createSettlement.validRealm;
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

    availableEstablished: (args) => {

        const {entityDb} = args;

        // check spawn entity exists but was used to found realm
        const entities = entityDb.queryMany(EntityQueries.ALL, undefined);
        const spawnEntity = entities.find(it => EntityUtils.hasComponent(it, "player-spawn"));
        if (spawnEntity && !EntityUtils.getComponentOrThrow(spawnEntity, "player-spawn").hasSettlement) {
            return false;
        }

        return true;
    },

    validateEstablished: (args) => {

        const {hasInteraction, commandDb, tileDb, position} = args;

        // check active interactions
        const validInteraction = !hasInteraction;
        if (!validInteraction) {
            return false;
        }

        // check base game state
        const tile = tileDb.querySingle(TileQueries.BY_POSITION, position);
        const validGameState = !!tile && tile.createSettlement.phase === "ESTABLISHED" && tile.createSettlement.validLocation && tile.createSettlement.validRealm;
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
        settlementEstablishedAvailable: () => DI.createSettlementValidation.availableEstablished({
            entityDb: DI.entityDatabase,
        }),
        settlementEstablished: (position: HexPosition) => DI.createSettlementValidation.validateEstablished({
            position: position,
            tileDb: DI.tileDatabase,
            commandDb: DI.commandDatabase,
            hasInteraction: hasInteraction,
        }),
        settlementFoundingAvailable: () => DI.createSettlementValidation.availableFounding({
            entityDb: DI.entityDatabase,
        }),
        settlementFounding: (position: HexPosition) => DI.createSettlementValidation.validateFounding({
            position: position,
            tileDb: DI.tileDatabase,
            commandDb: DI.commandDatabase,
            hasInteraction: hasInteraction,
        }),
    };
}
