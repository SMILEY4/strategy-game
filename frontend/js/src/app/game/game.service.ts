import {App} from "../../appContext";
import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {CameraService} from "./camera/game.camera.service";
import {gameInteractionEngine} from "./game.interaction-engine";
import {
    worldObjectMoveInteractionDefinition,
    WorldObjectMoveInteractionEvent,
} from "./worldobject/game.worldobject.interaction.move";
import {
    settlementCreateInteractionDefinition,
    SettlementCreateInteractionEvent,
} from "./settlement/game.settlement.interaction.create";
import {TileService} from "./tile/game.tile.service";
import {TileSummary} from "../../models/tile/tileSummary";

export const canvasHandle: CanvasHandle = new CanvasHandle();

export const GameService = {

    initialize(canvas: HTMLCanvasElement) {
        canvasHandle.set(canvas);
        App.gameRenderer.initialize(canvasHandle);
    },

    dispose() {
        App.gameRenderer.dispose();
        canvasHandle.set(null);
    },

    update() {
        App.gameRenderer.render(canvasHandle);
    },

    mouseMoved(dx: number, dy: number, clientX: number, clientY: number, leftBtnDown: boolean) {
        if (leftBtnDown) {
            // mouse has been dragged => move camera
            CameraService.move(dx, dy, canvasHandle);
        } else {
            // mouse has been moved => update hovered tile
            setMouseOverTile(TileService.pickTile(clientX, clientY));
        }
    },

    mouseScrolled(d: number, clientX: number, clientY: number) {
        CameraService.zoomAt(clientX, clientY, d > 0 ? "out" : "in", canvasHandle);
        setMouseOverTile(TileService.pickTile(clientX, clientY));
    },

    mouseClicked(clientX: number, clientY: number) {
        const clickedTile = TileService.pickTile(clientX, clientY);
        if (clickedTile != null) {

            // notify current interaction: move world object
            if (gameInteractionEngine.getInteractionId() === worldObjectMoveInteractionDefinition.id) {
                void gameInteractionEngine.dispatch<WorldObjectMoveInteractionEvent>({
                    eventId: "SELECT_TILE",
                    tile: clickedTile,
                });
                return;
            }

            // notify current interaction: create settlement
            if (gameInteractionEngine.getInteractionId() === settlementCreateInteractionDefinition.id) {
                void gameInteractionEngine.dispatch<SettlementCreateInteractionEvent>({
                    eventId: "SELECT_TILE",
                    tile: clickedTile,
                });
                return;
            }

            // if nothing else intercepted "click", handle by tile service
            TileService.handleClickOnTile(clickedTile);
        }
    },

};

function setMouseOverTile(tile: TileSummary | null) {
    if (App.gameSessionDatabase.get().hoverTile !== tile) {
        App.gameSessionDatabase.update(() => ({
            hoverTile: tile,
        }));
    }
}