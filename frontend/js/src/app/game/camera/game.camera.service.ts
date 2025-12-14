import {Tile} from "../../../models/tile/tile";
import {CanvasHandle} from "../../../common/webgl/canvasHandle";
import {Projections} from "../../../common/webgl/projections";
import {App} from "../../../appContext";
import {Camera} from "../../../common/webgl/camera";
import {CameraData} from "../../../models/misc/cameraData";
import {Db} from "../../database";

const ZOOM_FACTOR = 1.05;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 150;

export const CameraService = {

    /**
     * Set the camera position to center on the given tile
     */
    centerOnTile(tile: Tile.Position, zoom?: number): void {
        const pos = Projections.hexToWorld(tile.q, tile.r);
        const camera = getCameraData();
        setCameraData({
            x: -pos.x,
            y: -pos.y,
            zoom: zoom == undefined ? camera.zoom : zoom,
        });
    },


    /**
     * Move the camera by the given x and y distance
     */
    move(dx: number, dy: number, canvasHandle: CanvasHandle): void {
        // get current camera & create a camera clone looking at world (0,0)
        const cameraData = getCameraData();
        const cameraOrigin = Camera.create(
            {
                ...cameraData,
                x: 0,
                y: 0,
            },
            canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
            canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
        );

        // project mouse movement distance on screen to world
        // Note: camera looking at origin, i.e. (0,0) is in middle of screen. Need to offset screen coords accordingly
        const dScreen = Projections.screenToWorld(
            cameraOrigin,
            dx + canvasHandle.getClientWidth() / 2,
            dy + canvasHandle.getClientHeight() / 2,
        );

        setCameraData({
            x: cameraData.x + dScreen.x,
            y: cameraData.y + dScreen.y,
            zoom: cameraData.zoom,
        });
    },


    /**
     * Zoom the camera by the given direction
     */
    zoom(d: "in" | "out"): void {
        const cameraData = getCameraData();
        setCameraData({
            x: cameraData.x,
            y: cameraData.y,
            zoom: calculateZoom(cameraData.zoom, d),
        });
    },


    /**
     * Zoom the camera by the given direction at the given screen coordinates
     */
    zoomAt(x: number, y: number, d: "in" | "out", canvasHandle: CanvasHandle): void {
        // get current camera
        const cameraData = getCameraData();

        // zoom in (on center)
        const cameraDataZoomed = {
            x: cameraData.x,
            y: cameraData.y,
            zoom: calculateZoom(cameraData.zoom, d),
        };

        // get world position of given screen position before zoom
        const worldPosBefore = Projections.screenToWorld(
            Camera.create(
                cameraData,
                canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
                canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
            ),
            x, y,
        );

        // get world position of given screen position after zoom
        const worldPosAfter = Projections.screenToWorld(
            Camera.create(
                cameraDataZoomed,
                canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
                canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
            ),
            x, y,
        );

        // translate camera to keep given screen position in center
        cameraDataZoomed.x = cameraDataZoomed.x + (worldPosAfter.x - worldPosBefore.x);
        cameraDataZoomed.y = cameraDataZoomed.y + (worldPosAfter.y - worldPosBefore.y);

        // set new camera
        setCameraData(cameraDataZoomed);
    },

};

function calculateZoom(currentZoom: number, direction: "in" | "out"): number {
    const zoom = (direction == "in")
        ? currentZoom * ZOOM_FACTOR
        : currentZoom / ZOOM_FACTOR;
    return Math.max(ZOOM_MIN, Math.min(zoom, ZOOM_MAX));
}

function setCameraData(cameraData: CameraData) {
    Db.camera.set(cameraData);
}

function getCameraData(): CameraData {
    return Db.camera.get();
}