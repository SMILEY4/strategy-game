import {CanvasHandle} from "../shared/webgl/canvasHandle";
import {Camera} from "../shared/webgl/camera";
import {GroundRenderer} from "./ground/groundRenderer";
import {RenderModule} from "./renderModule";
import {BaseRenderer} from "../shared/webgl/baseRenderer";
import {RenderDataManager} from "./data/renderDataManager";
import {WebGLMonitor} from "../shared/webgl/monitor/webGLMonitor";
import {CameraDatabase} from "../state/cameraDatabase";
import {MonitoringRepository} from "../state/monitoringRepository";
import {WaterRenderer} from "./water/waterRenderer";
import {DetailRenderer} from "./detail/detailRenderer";
import {OverlayRenderer} from "./overlay/overlayRenderer";
import {WorldStartRenderer} from "./world/worldStartRenderer";
import {WorldStopRenderer} from "./world/worldStopRenderer";

export class GameRendererV2 {

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
            new WorldStartRenderer(canvasHandle),
            new WaterRenderer(canvasHandle),
            new GroundRenderer(canvasHandle),
            new DetailRenderer(canvasHandle),
            new WorldStopRenderer(canvasHandle),
            new OverlayRenderer(canvasHandle)
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

        this.renderer?.prepareFrame(camera, [0,0,0,0], false, 1);
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