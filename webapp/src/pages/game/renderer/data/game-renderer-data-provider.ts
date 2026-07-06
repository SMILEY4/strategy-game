import type {RenderCamera, TileCollection} from "@pages/game/renderer/data/models.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import type {CameraDatabase} from "@app/features/game/database/camera.database.ts";

/** Data provider interface for the game renderer, supplying tiles and camera state. */
export interface GameRendererDataProvider {
    getCameraRevId: () => string,
    getCamera: () => RenderCamera,
    getTilesRevId: () => string;
    getTiles: () => TileCollection;
}

interface Dependencies {
    tileDb: TileDatabase;
    cameraDb: CameraDatabase;
}

export const gameRendererDataProvider = ({tileDb, cameraDb}: Dependencies): GameRendererDataProvider => {

    return {

        getCameraRevId: () => {
            return cameraDb.getRevId();
        },

        getCamera: () => {
            return {
                revId: cameraDb.getRevId(),
                ...cameraDb.get()
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