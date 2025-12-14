import {Projections} from "../../../common/webgl/projections";
import {CanvasHandle} from "../../../common/webgl/canvasHandle";
import {Camera} from "../../../common/webgl/camera";
import {App} from "../../../appContext";
import {canvasHandle} from "../game.service";
import {TileSummary} from "../../../models/tile/tileSummary";
import {WorldObjectSummary} from "../../../models/worldobject/worldObjectSummary";
import {UseWorldObjectWindow} from "../../../ui/pages/ingame/windows/unit/useWorldObjectWindow";
import {UseTileWindow} from "../../../ui/pages/ingame/windows/tile/useTileWindow";
import {TileDatabase} from "../../../state/database/tileDatabase";
import {WorldObjectStateAccess} from "../worldobject/game.worldobject.state-access";

export const TileService = {

    pickTile(screenX: number, screenY: number): TileSummary | null {

        function buildCamera(canvasHandle: CanvasHandle): Camera {
            const cameraData = App.cameraDatabase.get();
            return Camera.create(
                cameraData,
                canvasHandle.getCanvasWidth(), canvasHandle.getCanvasHeight(),
                canvasHandle.getClientWidth(), canvasHandle.getClientHeight(),
            );
        }

        const hexPos = Projections.screenToHex(buildCamera(canvasHandle), screenX, screenY);

        const entity = App.tileDatabase.querySingle(TileDatabase.QUERY_BY_POSITION, [hexPos.x, hexPos.y]);
        if (!entity) {
            return null;
        }

        return {
            id: entity.id,
            position: entity.position,
        };
    },

    handleClickOnTile(tile: TileSummary) {
        // set tile as selected
        App.gameSessionDatabase.update(prev => ({
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
