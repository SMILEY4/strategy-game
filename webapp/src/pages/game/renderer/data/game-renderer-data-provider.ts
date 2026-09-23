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
import type {Route} from "@app/features/game/models/route.ts";
import {type RouteDatabase, RouteQueries} from "@app/features/game/database/route.database.ts";
import {type InteractionDatabase} from "@app/features/game/database/interaction.database.ts";
import {CreateTileImprovementInteraction} from "@app/features/game/gameplay/create-tile-improvement.interaction.ts";
import {getInteractionContext, getInteractionState, isInteractionActive} from "@modules/interaction/interaction.tools.ts";

export type RendererMapInteractionMode = "default" | "pick-tile"

export interface GameRendererDataProvider {
    getDebugData: () => VersionedLazy<DebugData>
    getCamera: () => VersionedLazy<Camera>,
    getTiles: () => VersionedLazy<Tile[]>,
    getEntities: () => VersionedLazy<Entity[]>,
    getRoutes: () => VersionedLazy<Route[]>,
    getCommands: () => VersionedLazy<Command[]>,
    getPointerPosition: () => VersionedLazy<PointerPosition>
    getSelectedTilePosition: () => HexPosition | null
    getSelectedEntity: () => Entity | null
    getMapMode: () => MapMode,
    getSelectableTilePositions: () => VersionedLazy<HexPosition[]>
    getInteractionMode: () => RendererMapInteractionMode
}

interface Dependencies {
    tileDb: TileDatabase;
    entityDb: EntityDatabase,
    routeDb: RouteDatabase,
    commandDb: CommandDatabase,
    selectedTileDb: SelectedTileDatabase,
    mapModeDb: MapModeDatabase,
    cameraDb: CameraDatabase;
    pointerPositionDb: PointerPositionDatabase
    interactionDb: InteractionDatabase,
    debugDb: DebugDatabase;
}

export const gameRendererDataProvider = (dependencies: Dependencies): GameRendererDataProvider => {

    const {
        tileDb,
        entityDb,
        routeDb,
        commandDb,
        selectedTileDb,
        mapModeDb,
        cameraDb,
        pointerPositionDb,
        interactionDb,
        debugDb,
    } = dependencies;

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

        getRoutes: () => createVersionedLazy<Route[]>(
            routeDb.getRevId(),
            () => routeDb.queryMany(RouteQueries.ALL, undefined),
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

        getInteractionMode: () => {
            if (isInteractionActive(interactionDb, CreateTileImprovementInteraction)) {
                const state = getInteractionState(interactionDb, CreateTileImprovementInteraction);
                if (state === "PickingSettlement") {
                    return "pick-tile";
                }
            }
            return "default";
        },

        getSelectableTilePositions: () => createVersionedLazy<HexPosition[]>(
            interactionDb.getRevId(),
            () => {
                if (isInteractionActive(interactionDb, CreateTileImprovementInteraction)) {
                    const state = getInteractionState(interactionDb, CreateTileImprovementInteraction);
                    if (state === "PickingSettlement") {
                        const context = getInteractionContext(interactionDb, CreateTileImprovementInteraction);
                        const availableSettlementIds = context?.availableSettlementEntityIds ?? [];
                        return availableSettlementIds
                            .map(id => entityDb.querySingle(EntityQueries.BY_ID, id))
                            .map(entity => entity!.position);
                    }
                }
                return [];
            }
        ),

    };
};