import {CanvasHandle} from "../logic/game/canvasHandle";
import {Camera} from "../shared/webgl/camera";
import {CameraRepository} from "../state/access/CameraRepository";
import {TilemapRenderer} from "./tilemap/tilemapRenderer";
import {RenderModule} from "./common/renderModule";
import {GLRenderer} from "../shared/webgl/glRenderer";
import {TileRepository} from "../state/access/TileRepository";
import {EntityRenderer} from "./entity/entityRenderer";

export class GameRenderer {

    private readonly canvasHandle: CanvasHandle;
    private readonly cameraRepository: CameraRepository;
    private readonly modules: RenderModule[];
    private renderer: GLRenderer | null = null;


    constructor(canvasHandle: CanvasHandle, cameraRepository: CameraRepository, tileRepository: TileRepository) {
        this.canvasHandle = canvasHandle;
        this.cameraRepository = cameraRepository;
        this.modules = [
            new TilemapRenderer(canvasHandle, tileRepository),
            new EntityRenderer(canvasHandle),
        ];
    }


    public initialize(): void {
        this.renderer = new GLRenderer(this.canvasHandle.getGL());
        this.modules.forEach(m => m.initialize());
    }

    public render() {
        const camera = this.getRenderCamera();
        this.renderer?.prepareFrame();
        this.modules.forEach(m => m.render(camera));
    }

    public dispose() {
        this.modules.forEach(m => m.dispose());
    }

    private getRenderCamera(): Camera {
        const data = this.cameraRepository.getCamera();
        return Camera.create(data, this.canvasHandle.getCanvasWidth(), this.canvasHandle.getCanvasHeight());
    }

}