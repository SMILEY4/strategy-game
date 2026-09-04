import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import type {CameraDatabase} from "@app/features/game/database/camera.database.ts";
import type {DebugData, DebugDatabase} from "@app/features/game/database/debug.database.ts";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import type {SelectedTileDatabase} from "@app/features/game/database/selected-tile.database.ts";
import {type EntityDatabase, EntityQueries} from "@app/features/game/database/entity.database.ts";
import {type CommandDatabase, CommandQueries} from "@app/features/game/database/command.database.ts";
import type {PointerPosition, PointerPositionDatabase} from "@app/features/game/database/pointer-position.database.ts";
import type {MapMode} from "@app/features/game/models/map-mode.ts";
import type {Entity} from "@app/features/game/models/entity.ts";
import type {MapModeDatabase} from "@app/features/game/database/mapmode.database.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {Tile} from "@app/features/game/models/tile.ts";
import type {Command} from "@app/features/game/models/command.ts";
import {createVersionedLazy, type VersionedLazy} from "@pages/game/renderer/data/versioned-data.ts";

export interface GameRendererDataProvider {
    getDebugData: () => VersionedLazy<DebugData>
    getCamera: () => VersionedLazy<Camera>,
    getTiles: () => VersionedLazy<Tile[]>,
    getEntities: () => VersionedLazy<Entity[]>,
    getCommands: () => VersionedLazy<Command[]>,
    getPointerPosition: () => VersionedLazy<PointerPosition>
    getSelectedTilePosition: () => HexPosition | null
    getSelectedEntity: () => Entity | null
    getMapMode: () => MapMode,
}

interface Dependencies {
    tileDb: TileDatabase;
    entityDb: EntityDatabase,
    commandDb: CommandDatabase,
    selectedTileDb: SelectedTileDatabase,
    mapModeDb: MapModeDatabase,
    cameraDb: CameraDatabase;
    pointerPositionDb: PointerPositionDatabase
    debugDb: DebugDatabase;
}

export const gameRendererDataProvider = ({
                                             tileDb,
                                             entityDb,
                                             commandDb,
                                             selectedTileDb,
                                             mapModeDb,
                                             cameraDb,
                                             pointerPositionDb,
                                             debugDb,
                                         }: Dependencies): GameRendererDataProvider => {

    return {

        getDebugData: () => createVersionedLazy<DebugData>(
            debugDb.getRevId(),
            () => debugDb.get(),
        ),

        getCamera: () => createVersionedLazy<Camera>(
            cameraDb.getRevId(),
            () => cameraDb.get(),
        ),

        getTiles: () => createVersionedLazy<Tile[]>(
            tileDb.getRevId(),
            () => tileDb.queryMany(TileQueries.ALL, undefined),
        ),

        getEntities: () => createVersionedLazy<Entity[]>(
            entityDb.getRevId(),
            () => entityDb.queryMany(EntityQueries.ALL, undefined),
        ),

        getCommands: () => createVersionedLazy<Command[]>(
            commandDb.getRevId(),
            () => commandDb.queryMany(CommandQueries.ALL, undefined),
        ),

        getPointerPosition: () => createVersionedLazy<PointerPosition>(
            pointerPositionDb.getRevId(),
            () => pointerPositionDb.get(),
        ),

        getSelectedTilePosition: () => {
            return selectedTileDb.get().selected;
        },

        getSelectedEntity: () => {
            const selectedTile = selectedTileDb.get().selected;
            if (!selectedTile) return null;
            return entityDb.querySingle(EntityQueries.BY_POSITION, selectedTile);
        },

        getMapMode: () => {
            return mapModeDb.get();
        },

    };
};