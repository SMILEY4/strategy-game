import {GameStateAccess} from "../../../ports/required/state/gameStateAccess";
import {WorldStateAccess} from "../../../ports/required/state/worldStateAccess";
import {GameCanvasHandle} from "../gameCanvasHandle";
import {MarkerRenderer} from "./markers/markerRenderer";
import {TilemapRenderer} from "./tilemap/tilemapRenderer";
import {Camera} from "./utils/camera";

export class Renderer {

    private readonly canvasHandle: GameCanvasHandle;

    private readonly gameStateAccess: GameStateAccess;
    private readonly worldStateAccess: WorldStateAccess;

    private readonly tilemapRenderer: TilemapRenderer;
    private readonly markerRenderer: MarkerRenderer;

    constructor(canvasHandle: GameCanvasHandle, gameStateAccess: GameStateAccess, worldStateAccess: WorldStateAccess) {
        this.canvasHandle = canvasHandle;
        this.gameStateAccess = gameStateAccess;
        this.worldStateAccess = worldStateAccess;
        this.tilemapRenderer = new TilemapRenderer(canvasHandle);
        this.markerRenderer = new MarkerRenderer(canvasHandle);
    }


    public initialize(): void {
        this.tilemapRenderer.initialize();
        this.markerRenderer.initialize();
    }


    public render(): void {
        const gl = this.canvasHandle.getGL();
        this.checkErrors(gl);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const camera = this.createCamera();
        const map = this.worldStateAccess.getTiles();
        const tileMouseOver = this.gameStateAccess.getTileMouseOver();
        const tileSelected = this.gameStateAccess.getTileSelected();

        this.tilemapRenderer.render(
            camera,
            map,
            tileMouseOver ? tileMouseOver : [9999, 9999],
            tileSelected ? tileSelected : [9999, 9999]
        );

        this.markerRenderer.render(camera, this.worldStateAccess.getMarkers(), this.gameStateAccess.getCommands());
    }


    private checkErrors(gl: WebGL2RenderingContext) {
        const error = gl.getError();
        if (error !== gl.NO_ERROR && error !== gl.CONTEXT_LOST_WEBGL) {
            alert("fail");
        }
    }


    private createCamera(): Camera {
        const camState = this.gameStateAccess.getCamera();
        const camera = new Camera();
        camera.setPosition(camState.x, camState.y);
        camera.setZoom(camState.zoom);
        camera.updateViewProjectionMatrix(this.canvasHandle.getCanvas().width, this.canvasHandle.getCanvas().height);
        return camera;
    }


    public dispose(): void {
        this.tilemapRenderer.dispose();
        this.markerRenderer.dispose();
    }

}