import {WorldRenderer} from "./world/worldRenderer";
import {RenderWorldFactory} from "./world/renderFactory";
import {RenderWorld} from "./world/data/renderWorld";
import {Camera} from "./common/camera";
import {GLRenderer} from "./common/glRenderer";
import {CameraStateAccess} from "../../state/access/CameraStateAccess";
import {CanvasHandle} from "../game/canvasHandle";
import {WorldUpdater} from "./world/worldUpdater";
import {GameStateAccess} from "../../state/access/GameStateAccess";

export class GameRenderer {

    private canvasHandle: CanvasHandle;
    private worldRenderer: WorldRenderer | null = null;
    private world: RenderWorld | null = null;
    private worldUpdater: WorldUpdater | null = null;

    constructor(canvasHandle: CanvasHandle) {
        this.canvasHandle = canvasHandle;
    }

    public initialize() {
        const gl = this.canvasHandle.getGL();
        this.worldRenderer = new WorldRenderer(new GLRenderer(gl));
        this.world = RenderWorldFactory.createWorld(gl);
        this.worldUpdater = new WorldUpdater(gl, this.world);
    }

    public updateWorld() {
        const gl = this.canvasHandle.getGL();
        if (gl && this.worldUpdater) {
            this.worldUpdater.updateOnNextTurn(this.getRenderCamera());
        }
    }


    public render() {
        const gl = this.canvasHandle.getGL();
        const camera = this.getRenderCamera();

        if (this.worldUpdater) {
            this.worldUpdater.update(camera);
        }

        if (this.world && this.worldRenderer && gl) {
            this.worldRenderer.render(this.world, camera);
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