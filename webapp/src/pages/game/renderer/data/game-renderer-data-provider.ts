import type {RenderCamera, TileCollection} from "@pages/game/renderer/data/models.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import type {CameraDatabase} from "@app/features/game/database/camera.database.ts";
import type {DebugData, DebugDatabase} from "@app/features/game/database/debug.database.ts";

/** Data provider interface for the game renderer, supplying tiles and camera state. */
export interface GameRendererDataProvider {
    getDebugData: () => DebugData & { revId: string }
    getCameraRevId: () => string,
    getCamera: () => RenderCamera,
    getTilesRevId: () => string;
    getTiles: () => TileCollection;
}

interface Dependencies {
    tileDb: TileDatabase;
    cameraDb: CameraDatabase;
    debugDb: DebugDatabase;
}

export const gameRendererDataProvider = ({tileDb, cameraDb, debugDb}: Dependencies): GameRendererDataProvider => {

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


    };
};