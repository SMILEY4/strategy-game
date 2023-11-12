import {CanvasHandle} from "../logic/game/canvasHandle";
import {Camera} from "../shared/webgl/camera";
import {CameraRepository} from "../state/access/CameraRepository";
import {TilemapRenderer} from "./tilemap/tilemapRenderer";
import {RenderModule} from "./common/renderModule";
import {GLRenderer} from "../shared/webgl/glRenderer";
import {EntityRenderer} from "./entity/entityRenderer";
import {RenderDataManager} from "./data/renderDataManager";

export class GameRenderer {

    private readonly canvasHandle: CanvasHandle;
    private readonly cameraRepository: CameraRepository;
    private readonly renderDataManager: RenderDataManager;
    private readonly modules: RenderModule[];
    private renderer: GLRenderer | null = null;


    constructor(canvasHandle: CanvasHandle, cameraRepository: CameraRepository, renderDataManager: RenderDataManager) {
        this.canvasHandle = canvasHandle;
        this.cameraRepository = cameraRepository;
        this.renderDataManager = renderDataManager;
        this.modules = [
            new TilemapRenderer(canvasHandle),
            new EntityRenderer(canvasHandle),
        ];
    }


    public initialize(): void {
        this.renderDataManager.initialize();
        this.renderer = new GLRenderer(this.canvasHandle.getGL());
        this.modules.forEach(m => m.initialize());
    }

    public render() {
        this.renderDataManager.updateData();
        const camera = this.getRenderCamera();
        const data = this.renderDataManager.getData();
        this.renderer?.prepareFrame();
        this.modules.forEach(m => m.render(camera, data));
    }

    public dispose() {
        this.renderDataManager.disposeData();
        this.modules.forEach(m => m.dispose());
    }

    private getRenderCamera(): Camera {
        const data = this.cameraRepository.getCamera();
        return Camera.create(data, this.canvasHandle.getCanvasWidth(), this.canvasHandle.getCanvasHeight());
    }

}