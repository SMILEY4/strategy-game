import type {RenderCameraData, TileCollection} from "@pages/game/renderer/data/models.ts";
import {type TileDatabase, TileQueries} from "@app/features/game/database/tile.database.ts";
import {vec3} from "gl-matrix";

/** Data provider interface for the game renderer, supplying tiles and camera state. */
export interface GameRendererDataProvider {
    updateCamera: (update: (camera: RenderCameraData) => void) => void,
    getCameraRevId: () => number,
    getCamera: () => RenderCameraData,
    getTilesRevId: () => string;
    getTiles: () => TileCollection;
}

interface Dependencies {
    tileDb: TileDatabase;
}

export const gameRendererDataProvider = ({tileDb}: Dependencies): GameRendererDataProvider => {

    let camera: RenderCameraData = {
        revId: 0,
        up: vec3.fromValues(0, 1, 0),
        position: vec3.fromValues(-50, 40, 0),
        direction: vec3.fromValues(2, -1, 0),
        fov: 50,
        near: 0.01,
        far: 1000,
        aspect: 1,
    };

    return {

        updateCamera: (update: (camera: RenderCameraData) => void) => {
            const modified = {...camera};
            update(modified);
            modified.revId = modified.revId + 1;
            camera = modified
        },

        getCameraRevId: () => {
            return camera.revId;
        },

        getCamera: () => {
            return camera;
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