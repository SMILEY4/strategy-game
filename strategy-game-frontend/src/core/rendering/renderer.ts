import {CameraState} from "../../models/state/cameraState";
import {GameRepository} from "../required/gameRepository";
import {UserRepository} from "../required/userRepository";
import {WorldRepository} from "../required/worldRepository";
import {GameCanvasHandle} from "./gameCanvasHandle";
import {TilemapRenderer} from "./tilemap/tilemapRenderer";
import {TileObjectRenderer} from "./tileobject/tileObjectRenderer";
import {Camera} from "./utils/camera";

export class Renderer {

    private readonly canvasHandle: GameCanvasHandle;
    private readonly gameRepository: GameRepository;
    private readonly worldRepository: WorldRepository;
    private readonly tilemapRenderer: TilemapRenderer;
    private readonly tileObjectRenderer: TileObjectRenderer;

    constructor(canvasHandle: GameCanvasHandle, gameRepository: GameRepository, worldRepository: WorldRepository, userRepository: UserRepository) {
        this.canvasHandle = canvasHandle;
        this.gameRepository = gameRepository;
        this.worldRepository = worldRepository;
        this.tilemapRenderer = new TilemapRenderer(canvasHandle);
        this.tileObjectRenderer = new TileObjectRenderer(canvasHandle, userRepository);
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

        const gameState = this.worldRepository.getCompleteState();
        const localGameState = this.gameRepository.getCompleteState();
        const combinedRevId = this.worldRepository.getRevisionId() + "_" + this.gameRepository.getRevisionId();
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