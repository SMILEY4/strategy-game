import {Projections} from "../../../common/webgl/projections";
import {CanvasHandle} from "../../../common/webgl/canvasHandle";
import {Camera} from "../../../common/webgl/camera";
import {canvasHandle} from "../game.service";
import {TileSummary} from "../../../models/tile/tileSummary";
import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {UseWorldObjectWindow} from "../../../ui/pages/ingame/windows/worldobject/useWorldObjectWindow";
import {UseTileWindow} from "../../../ui/pages/ingame/windows/tile/useTileWindow";
import {TileDatabase} from "../../database/tileDatabase";
import {WorldObjectStateAccess} from "../worldobject/worldobject.state-access";
import {Db} from "../../database";
import {GameAudio} from "../../audio/gameAudio";

export const TileService = {

    pickTile(screenX: number, screenY: number): TileSummary | null {

        function buildCamera(canvasHandle: CanvasHandle): Camera {
            const cameraData = Db.camera.get();
            return Camera.create(
                cameraData,
                canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
                canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
            );
        }

        const hexPos = Projections.screenToHex(buildCamera(canvasHandle), screenX, screenY);

        const entity = Db.tile.querySingle(TileDatabase.QUERY_BY_POSITION, [hexPos.x, hexPos.y]);
        if (!entity) {
            return null;
        }

        return {
            id: entity.id,
            position: entity.position,
        };
    },

    handleClickOnTile(tile: TileSummary) {
        GameAudio.CLICK_PRIMARY.play()
        // set tile as selected
        Db.gameSession.update(prev => ({
            ...prev,
            selectedTile: tile,
        }))
        // is there one world object on this tile? -> open world object window instead
        const worldObjects: WorldObjectSummary[] = WorldObjectStateAccess.getSummariesAt(tile.position.q, tile.position.r);
        if (worldObjects.length === 1) {
            UseWorldObjectWindow.open(worldObjects[0].id);
            return;
        }
        // open tile window
        UseTileWindow.open(tile.id);
    },

};
