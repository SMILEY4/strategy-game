import {CanvasHandle} from "../shared/webgl/canvasHandle";
import {Camera} from "../shared/webgl/camera";
import {TilemapRenderer} from "./tilemap/tilemapRenderer";
import {RenderModule} from "./renderModule";
import {BaseRenderer} from "../shared/webgl/baseRenderer";
import {EntityRenderer} from "./entity/entityRenderer";
import {RenderDataManager} from "./data/renderDataManager";
import {EntityMaskRenderer} from "./entitymask/entityMaskRenderer";
import {StampRenderer} from "./stamps/stampRenderer";
import {RoutesRenderer} from "./routes/routesRenderer";
import {WebGLMonitor} from "../shared/webgl/monitor/webGLMonitor";
import {CameraDatabase} from "../state/cameraDatabase";
import {MonitoringRepository} from "../state/monitoringRepository";

export class GameRenderer {

    private readonly canvasHandle: CanvasHandle;
    private readonly monitor: WebGLMonitor;
    private readonly monitoringRepository: MonitoringRepository;
    private readonly cameraDb: CameraDatabase;
    private readonly renderDataManager: RenderDataManager;
    private readonly modules: RenderModule[];
    private renderer: BaseRenderer | null = null;


    constructor(
        canvasHandle: CanvasHandle,
        monitor: WebGLMonitor,
        monitoringRepository: MonitoringRepository,
        cameraDb: CameraDatabase,
        renderDataManager: RenderDataManager,
    ) {
        this.canvasHandle = canvasHandle;
        this.monitor = monitor;
        this.monitoringRepository = monitoringRepository;
        this.cameraDb = cameraDb;
        this.renderDataManager = renderDataManager;
        this.modules = [
            new RoutesRenderer(canvasHandle),
            new EntityMaskRenderer(canvasHandle),
            new TilemapRenderer(canvasHandle),
            new EntityRenderer(canvasHandle),
            new StampRenderer(),
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
        const camera = this.getRenderCamera();
        this.renderDataManager.updateData(camera);
        const data = this.renderDataManager.getData();
        this.renderer?.prepareFrame(camera, [0,0,0,0], false, 0, false);
        this.modules.forEach(m => m.render(camera, data));
        this.monitor.endFrame();
        this.monitoringRepository.setWebGLMonitorData(this.monitor.getData());
    }

    public dispose() {
        this.renderDataManager.disposeData();
        this.modules.forEach(m => m.dispose());
    }

    private getRenderCamera(): Camera {
        const data = this.cameraDb.get();
        return Camera.create(
            data,
            this.canvasHandle.getCanvasWidth(),
            this.canvasHandle.getCanvasHeight(),
            this.canvasHandle.getClientWidth(),
            this.canvasHandle.getClientHeight(),
        );
    }

}