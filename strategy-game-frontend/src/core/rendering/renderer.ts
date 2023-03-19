import {CameraState} from "../models/cameraState";
import {GameRepository} from "../required/gameRepository";
import {UserRepository} from "../required/userRepository";
import {WorldRepository} from "../required/worldRepository";
import {TilemapUtils} from "../tilemap/tilemapUtils";
import {GameCanvasHandle} from "./gameCanvasHandle";
import {LineRenderer} from "./lines/lineRenderer";
import {TilemapRenderer} from "./tilemap/tilemapRenderer";
import {TileObjectRenderer} from "./tileobject/tileObjectRenderer";
import {Camera} from "./utils/camera";
import {ShaderSourceManager} from "./utils/shaderSourceManager";

export class Renderer {

    private readonly canvasHandle: GameCanvasHandle;
    private readonly gameRepository: GameRepository;
    private readonly worldRepository: WorldRepository;
    private readonly tilemapRenderer: TilemapRenderer;
    private readonly tileObjectRenderer: TileObjectRenderer;

    private readonly lineRenderer: LineRenderer;

    constructor(canvasHandle: GameCanvasHandle, shaderSourceManager: ShaderSourceManager, gameRepository: GameRepository, worldRepository: WorldRepository, userRepository: UserRepository) {
        this.canvasHandle = canvasHandle;
        this.gameRepository = gameRepository;
        this.worldRepository = worldRepository;
        this.tilemapRenderer = new TilemapRenderer(canvasHandle, shaderSourceManager);
        this.tileObjectRenderer = new TileObjectRenderer(canvasHandle, shaderSourceManager, userRepository);
        this.lineRenderer = new LineRenderer(canvasHandle, shaderSourceManager);
    }


    public initialize(): void {
        this.tilemapRenderer.initialize();
        this.tileObjectRenderer.initialize();
        this.lineRenderer.initialize();
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

        this.lineRenderer.removeAllLines();
        gameState.routes.forEach(route => {
            const positions = route.path.map(node => TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, node.q, node.r));
            this.lineRenderer.registerLine(route.routeId, positions, 1, [1, 1, 1, 0.3]);
        })

        this.tilemapRenderer.render(combinedRevId, camera, gameState, localGameState);
        this.lineRenderer.render(camera);
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