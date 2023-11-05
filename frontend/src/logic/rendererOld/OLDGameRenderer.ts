import {WorldRenderer} from "./world/worldRenderer";
import {RenderWorldFactory} from "./world/renderFactory";
import {RenderWorld} from "./world/data/renderWorld";
import {Camera} from "../../shared/webgl/camera";
import {GLRenderer} from "../../shared/webgl/glRenderer";
import {CanvasHandle} from "../game/canvasHandle";
import {WorldUpdater} from "./world/worldUpdater";
import {CameraRepository} from "../../state/access/CameraRepository";
import {CommandRepository} from "../../state/access/CommandRepository";
import {MapModeRepository} from "../../state/access/MapModeRepository";
import {TileRepository} from "../../state/access/TileRepository";

export class OLDGameRenderer {

    private readonly canvasHandle: CanvasHandle;
    private readonly worldUpdater: WorldUpdater;
    private readonly cameraRepository: CameraRepository;
    private readonly commandRepository: CommandRepository;
    private readonly mapModeRepository: MapModeRepository;
    private readonly tileRepository: TileRepository;
    private worldRenderer: WorldRenderer | null = null;
    private world: RenderWorld | null = null;

    constructor(
        canvasHandle: CanvasHandle,
        worldUpdater: WorldUpdater,
        cameraRepository: CameraRepository,
        commandRepository: CommandRepository,
        mapModeRepository: MapModeRepository,
        tileRepository: TileRepository,
    ) {
        this.canvasHandle = canvasHandle;
        this.worldUpdater = worldUpdater;
        this.cameraRepository = cameraRepository;
        this.commandRepository = commandRepository;
        this.mapModeRepository = mapModeRepository;
        this.tileRepository = tileRepository;
    }

    public initialize() {
        const gl = this.canvasHandle.getGL();
        this.worldRenderer = new WorldRenderer(new GLRenderer(gl));
        this.world = RenderWorldFactory.createWorld(gl, this.mapModeRepository, this.tileRepository);
        this.worldUpdater.setWorld(this.world);
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
        const data = this.cameraRepository.getCamera();
        return Camera.create(data, this.canvasHandle.getCanvasWidth(), this.canvasHandle.getCanvasHeight());
    }

}