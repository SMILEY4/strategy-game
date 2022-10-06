import {GameStateAccess} from "../../external/state/game/gameStateAccess";
import {LocalGameStateAccess} from "../../external/state/localgame/localGameStateAccess";
import {UserStateAccess} from "../../external/state/user/userStateAccess";
import {CameraState} from "../../models/state/cameraState";
import {GameCanvasHandle} from "./gameCanvasHandle";
import {TilemapRenderer} from "./tilemap/tilemapRenderer";
import {TileObjectRenderer} from "./tileobject/tileObjectRenderer";
import {Camera} from "./utils/camera";

export class Renderer {

    private readonly canvasHandle: GameCanvasHandle;

    private readonly localGameStateAccess: LocalGameStateAccess;
    private readonly gameStateAccess: GameStateAccess;

    private readonly tilemapRenderer: TilemapRenderer;
    private readonly tileObjectRenderer: TileObjectRenderer;

    constructor(canvasHandle: GameCanvasHandle, localGameStateAccess: LocalGameStateAccess, gameStateAccess: GameStateAccess, userAccess: UserStateAccess) {
        this.canvasHandle = canvasHandle;
        this.localGameStateAccess = localGameStateAccess;
        this.gameStateAccess = gameStateAccess;
        this.tilemapRenderer = new TilemapRenderer(canvasHandle);
        this.tileObjectRenderer = new TileObjectRenderer(canvasHandle, userAccess);
    }


    public initialize(): void {
        this.tilemapRenderer.initialize();
        this.tileObjectRenderer.initialize();
    }


    public render(): void {
        const gl = this.canvasHandle.getGL();

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const gameState = this.gameStateAccess.getState();
        const localGameState = this.localGameStateAccess.getState();
        const combinedRevId = this.gameStateAccess.getStateRevision() + "_" + this.localGameStateAccess.getStateRevision();
        const camera = this.createCamera(localGameState.camera);

        this.tilemapRenderer.render(combinedRevId, camera, gameState, localGameState);
        this.tileObjectRenderer.render(camera, gameState, localGameState);
    }


    private createCamera(camState: CameraState): Camera {
        const camera = new Camera();
        camera.setPosition(camState.x, camState.y);
        camera.setZoom(camState.zoom);
        camera.updateViewProjectionMatrix(this.canvasHandle.getCanvas().width, this.canvasHandle.getCanvas().height);
        return camera;
    }


    public dispose(): void {
        this.tilemapRenderer.dispose();
        this.tileObjectRenderer.dispose();
    }

}