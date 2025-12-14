import {Projections} from "../../../common/webgl/projections";
import {CanvasHandle} from "../../../common/webgl/canvasHandle";
import {Camera} from "../../../common/webgl/camera";
import {App} from "../../../appContext";
import {canvasHandle} from "../game.service";
import {TileSummary} from "../../../models/tile/tileSummary";
import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {UseWorldObjectWindow} from "../../../ui/pages/ingame/windows/unit/useWorldObjectWindow";
import {UseTileWindow} from "../../../ui/pages/ingame/windows/tile/useTileWindow";

export const TileService = {

    pickTile(screenX: number, screenY: number): TileSummary | null {

        function buildCamera(canvasHandle: CanvasHandle): Camera {
            const cameraData = App.gameStateAccess.getCamera();
            return Camera.create(
                cameraData,
                canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
                canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
            );
        }

        const hexPos = Projections.screenToHex(buildCamera(canvasHandle), screenX, screenY);
        return App.gameStateAccess.getTileSummaryAt(hexPos.x, hexPos.y);
    },

    handleClickOnTile(tile: TileSummary) {
        // is there one world object on this tile? -> open world object window instead
        const worldObjects: WorldObjectSummary[] = App.gameStateAccess.getWorldObjectSummariesAt(tile.position.q, tile.position.r);
        if (worldObjects.length === 1) {
            UseWorldObjectWindow.open(worldObjects[0].id);
            return;
        }
        // open tile window
        UseTileWindow.open(tile.id);
    },

};