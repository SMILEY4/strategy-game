import {CanvasHandle} from "../shared/webgl/canvasHandle";
import {Camera} from "../shared/webgl/camera";
import {CameraRepository} from "../state/access/CameraRepository";
import {TilemapRenderer} from "./tilemap/tilemapRenderer";
import {RenderModule} from "./renderModule";
import {BaseRenderer} from "../shared/webgl/baseRenderer";
import {EntityRenderer} from "./entity/entityRenderer";
import {RenderDataManager} from "./data/renderDataManager";
import {EntityMaskRenderer} from "./entitymask/entityMaskRenderer";
import {LabelRenderer} from "./labels/labelRenderer";
import {RoutesRenderer} from "./routes/routesRenderer";
import {TileRepository} from "../state/access/TileRepository";
import {WebGLMonitor} from "../shared/webgl/monitor/webGLMonitor";
import {MonitoringRepository} from "../state/access/MonitoringRepository";

export class GameRenderer {

    private readonly canvasHandle: CanvasHandle;
    private readonly monitor: WebGLMonitor;
    private readonly monitoringRepository: MonitoringRepository;
    private readonly cameraRepository: CameraRepository;
    private readonly renderDataManager: RenderDataManager;
    private readonly modules: RenderModule[];
    private renderer: BaseRenderer | null = null;


    constructor(
        canvasHandle: CanvasHandle,
        monitor: WebGLMonitor,
        monitoringRepository: MonitoringRepository,
        cameraRepository: CameraRepository,
        renderDataManager: RenderDataManager,
        tileRepository: TileRepository,
    ) {
        this.canvasHandle = canvasHandle;
        this.monitor = monitor;
        this.monitoringRepository = monitoringRepository;
        this.cameraRepository = cameraRepository;
        this.renderDataManager = renderDataManager;
        this.modules = [
            new RoutesRenderer(canvasHandle),
            new EntityMaskRenderer(canvasHandle),
            new TilemapRenderer(canvasHandle),
            new EntityRenderer(canvasHandle),
            new LabelRenderer(tileRepository),
        ];
    }


    public initialize(): void {
        this.monitor.attach(this.canvasHandle.getGL());

        this.renderDataManager.initialize();
        this.renderer = new BaseRenderer(this.canvasHandle.getGL());
        this.modules.forEach(m => m.initialize());
    }

    public render() {
        this.monitor.beginFrame();
        this.renderDataManager.updateData();
        const camera = this.getRenderCamera();
        const data = this.renderDataManager.getData();
        this.renderer?.prepareFrame(camera);
        this.modules.forEach(m => m.render(camera, data));
        this.monitor.endFrame();
        this.monitoringRepository.setWebGLMonitorData(this.monitor.getData());
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