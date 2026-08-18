import type {CommandCollection, EntityCollection, RenderCamera, TileCollection} from "@pages/game/renderer/data/models.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import type {CameraDatabase} from "@app/features/game/database/camera.database.ts";
import type {DebugData, DebugDatabase} from "@app/features/game/database/debug.database.ts";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import type {SelectedTileDatabase} from "@app/features/game/database/selected-tile.database.ts";
import {type EntityDatabase, EntityQueries} from "@app/features/game/database/entity.database.ts";
import {type CommandDatabase, CommandQueries} from "@app/features/game/database/command.database.ts";

/** Data provider interface for the game renderer, supplying tiles and camera state. */
export interface GameRendererDataProvider {
    getDebugData: () => DebugData & { revId: string }
    getCameraRevId: () => string,
    getCamera: () => RenderCamera,
    getTilesRevId: () => string;
    getTiles: () => TileCollection;
    getSelectedTilePosition: () => HexPosition | null
    getEntitiesRevId: () => string;
    getEntities: () => EntityCollection;
    getCommands: () => CommandCollection
    getCommandsRevId: () => string
}

interface Dependencies {
    tileDb: TileDatabase;
    entityDb: EntityDatabase,
    commandDb: CommandDatabase,
    selectedTileDb: SelectedTileDatabase,
    cameraDb: CameraDatabase;
    debugDb: DebugDatabase;
}

export const gameRendererDataProvider = ({
                                             tileDb,
                                             entityDb,
                                             commandDb,
                                             selectedTileDb,
                                             cameraDb,
                                             debugDb,
                                         }: Dependencies): GameRendererDataProvider => {

    return {

        getDebugData: () => {
            return {
                ...debugDb.get(),
                revId: debugDb.getRevId(),
            };
        },

        getCameraRevId: () => {
            return cameraDb.getRevId();
        },

        getCamera: () => {
            return {
                revId: cameraDb.getRevId(),
                ...cameraDb.get(),
            };
        },

        getTilesRevId: () => {
            return tileDb.getRevId();
        },

        getTiles: () => {
            return {
                revId: tileDb.getRevId(),
                tiles: tileDb.queryMany(TileQueries.ALL, undefined),
            };
        },

        getSelectedTilePosition: () => {
            return selectedTileDb.get().selected;
        },

        getEntitiesRevId: () => {
            return entityDb.getRevId();
        },

        getEntities: () => {
            return {
                revId: entityDb.getRevId(),
                entities: entityDb.queryMany(EntityQueries.ALL, undefined),
            };
        },

        getCommands: () => {
            return {
                revId: commandDb.getRevId(),
                commands: commandDb.queryMany(CommandQueries.ALL, undefined),
            };
        },

        getCommandsRevId: () => {
            return commandDb.getRevId();
        },

    };
};