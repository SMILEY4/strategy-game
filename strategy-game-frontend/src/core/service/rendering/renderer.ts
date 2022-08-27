import {GameStateAccess} from "../../../external/state/game/gameStateAccess";
import {LocalGameStateAccess} from "../../../external/state/localgame/localGameStateAccess";
import {UserStateAccess} from "../../../external/state/user/userStateAccess";
import {GameCanvasHandle} from "../gameCanvasHandle";
import {MapLabelRenderer} from "./maplabels/mapLabelRenderer";
import {TileContentRenderer} from "./tilecontent/tileContentRenderer";
import {TilemapRenderer} from "./tilemap/tilemapRenderer";
import {Camera} from "./utils/camera";
import {glErrorToString} from "./utils/webglErrors";

export class Renderer {

    private readonly canvasHandle: GameCanvasHandle;

    private readonly localGameStateAccess: LocalGameStateAccess;
    private readonly gameStateAccess: GameStateAccess;

    private readonly tilemapRenderer: TilemapRenderer;
    private readonly tileContentRenderer: TileContentRenderer;

    private readonly mapLabelRenderer: MapLabelRenderer;

    constructor(canvasHandle: GameCanvasHandle, localGameStateAccess: LocalGameStateAccess, gameStateAccess: GameStateAccess, userAccess: UserStateAccess) {
        this.canvasHandle = canvasHandle;
        this.localGameStateAccess = localGameStateAccess;
        this.gameStateAccess = gameStateAccess;
        this.tilemapRenderer = new TilemapRenderer(canvasHandle);
        this.tileContentRenderer = new TileContentRenderer(canvasHandle, userAccess);
        this.mapLabelRenderer = new MapLabelRenderer(canvasHandle);
    }


    public initialize(): void {
        this.tilemapRenderer.initialize();
        this.tileContentRenderer.initialize();
        this.mapLabelRenderer.initialize();
    }


    public render(): void {
        const gl = this.canvasHandle.getGL();
        this.checkErrors(gl);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const camera = this.createCamera();
        const gameState = this.gameStateAccess.getState();
        const localGameState = this.localGameStateAccess.getState();
        const combinedRevId = this.gameStateAccess.getStateRevision() + "_" + this.localGameStateAccess.getStateRevision();

        this.tilemapRenderer.render(combinedRevId, camera, gameState, localGameState);
        this.tileContentRenderer.render(camera, gameState, localGameState);
        this.mapLabelRenderer.render(camera, gameState, localGameState);
    }


    private checkErrors(gl: WebGL2RenderingContext) {
        const error = gl.getError();
        if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL) {
            alert("gl error: " + glErrorToString(error));
        }
    }


    private createCamera(): Camera {
        const camState = this.localGameStateAccess.getCamera();
        const camera = new Camera();
        camera.setPosition(camState.x, camState.y);
        camera.setZoom(camState.zoom);
        camera.updateViewProjectionMatrix(this.canvasHandle.getCanvas().width, this.canvasHandle.getCanvas().height);
        return camera;
    }


    public dispose(): void {
        this.tilemapRenderer.dispose();
        this.tileContentRenderer.dispose();
        this.mapLabelRenderer.dispose();
    }

}