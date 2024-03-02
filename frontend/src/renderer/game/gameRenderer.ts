import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {GameRenderGraph} from "./gameRenderGraph";
import {TileDatabase} from "../../state/tileDatabase";
import {CameraDatabase} from "../../state/cameraDatabase";
import {Camera} from "../../shared/webgl/camera";
import {RouteDatabase} from "../../state/routeDatabase";
import {GameSessionDatabase} from "../../state/gameSessionDatabase";
import {CommandDatabase} from "../../state/commandDatabase";
import {GameRenderConfig} from "./gameRenderConfig";

export class GameRenderer {

    private readonly canvasHandle: CanvasHandle;
    private readonly cameraDb: CameraDatabase;
    private readonly tileDb: TileDatabase;
    private readonly routeDb: RouteDatabase;
    private readonly gameSessionDb: GameSessionDatabase;
    private readonly commandDb: CommandDatabase;

    private renderConfig: GameRenderConfig | null = null
    private renderGraph: GameRenderGraph | null = null;

    constructor(
        canvasHandle: CanvasHandle,
        cameraDb: CameraDatabase,
        tileDb: TileDatabase,
        routeDb: RouteDatabase,
        gameSessionDb: GameSessionDatabase,
        commandDb: CommandDatabase,
    ) {
        this.canvasHandle = canvasHandle;
        this.cameraDb = cameraDb;
        this.tileDb = tileDb;
        this.routeDb = routeDb;
        this.gameSessionDb = gameSessionDb;
        this.commandDb = commandDb;
    }

    public initialize(): void {
        GameRenderConfig.initialize();
        this.renderGraph = new GameRenderGraph(this.canvasHandle.getGL(), () => this.renderConfig!, this.tileDb, this.routeDb, this.gameSessionDb, this.commandDb);
        this.renderGraph.initialize();
    }

    public render() {
        this.renderConfig = GameRenderConfig.load()
        this.renderGraph?.updateCamera(this.getRenderCamera());
        this.renderGraph?.execute();
    }

    public dispose() {
        this.renderGraph?.dispose();
        this.renderGraph = null;
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