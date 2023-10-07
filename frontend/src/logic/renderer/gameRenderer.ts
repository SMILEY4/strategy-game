import {WorldRenderer} from "./world/worldRenderer";
import {RenderWorldFactory} from "./world/renderFactory";
import {RenderWorld} from "./world/renderWorld";
import {Camera} from "./common/camera";
import {GLRenderer} from "./common/glRenderer";
import {RenderChunkFactory} from "./world/renderChunkFactory";
import {CameraStateAccess} from "../../state/access/CameraStateAccess";
import {GameStateAccess} from "../../state/access/GameStateAccess";
import {CanvasHandle} from "../game/canvasHandle";

export class GameRenderer {

    private canvasHandle: CanvasHandle;
    private worldRenderer: WorldRenderer | null = null;
    private world: RenderWorld | null = null;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }

    public initialize() {
        const gl = this.canvasHandle.getGL();
        this.worldRenderer = new WorldRenderer(new GLRenderer(gl));
        this.world = RenderWorldFactory.createWorld(gl);
    }

    public updateWorld() {
        const gl = this.canvasHandle.getGL();
        if (gl) {
            this.world?.getLayers().forEach(layer => {
                layer.getChunks().forEach(chunk => {
                    chunk.dispose();
                });
            });
            this.world?.getLayers()[0].setChunks(RenderChunkFactory.create(
                gl,
                GameStateAccess.getTiles(),
                this.world?.getLayers()[0].getShaderAttributes(),
            ));
        }
    }


    public render() {
        const gl = this.canvasHandle.getGL();
        if (this.world && this.worldRenderer && gl) {
            this.worldRenderer.render(this.world, this.getRenderCamera());
        }
    }

    public dispose() {
        this.worldRenderer?.dispose();
        this.world?.dispose();
    }

    private getRenderCamera(): Camera {
        const data = CameraStateAccess.getCamera();
        return Camera.create(data, this.canvasHandle.getCanvasWidth(), this.canvasHandle.getCanvasHeight());
    }

}