import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {GameWebGlRenderGraph} from "./gameWebGlRenderGraph";
import {TileDatabase} from "../../state/tileDatabase";
import {CameraDatabase} from "../../state/cameraDatabase";
import {Camera} from "../../shared/webgl/camera";
import {RouteDatabase} from "../../state/routeDatabase";
import {GameSessionDatabase} from "../../state/gameSessionDatabase";
import {CommandDatabase} from "../../state/commandDatabase";
import {GameRenderConfig} from "./gameRenderConfig";
import {ChangeProvider} from "./changeProvider";
import {GameHtmlRenderGraph} from "./gameHtmlRenderGraph";
import {CityDatabase} from "../../state/cityDatabase";

export class GameRenderer {

    private readonly changeProvider;
    private readonly canvasHandle: CanvasHandle;
    private readonly cameraDb: CameraDatabase;
    private readonly tileDb: TileDatabase;
    private readonly cityDb: CityDatabase;
    private readonly routeDb: RouteDatabase;
    private readonly gameSessionDb: GameSessionDatabase;
    private readonly commandDb: CommandDatabase;

    private renderConfig: GameRenderConfig | null = null;
    private webGlRenderGraph: GameWebGlRenderGraph | null = null;
    private htmlRenderGraph: GameHtmlRenderGraph | null = null;

    constructor(
        canvasHandle: CanvasHandle,
        cameraDb: CameraDatabase,
        tileDb: TileDatabase,
        cityDb: CityDatabase,
        routeDb: RouteDatabase,
        gameSessionDb: GameSessionDatabase,
        commandDb: CommandDatabase,
    ) {
        this.canvasHandle = canvasHandle;
        this.cameraDb = cameraDb;
        this.tileDb = tileDb;
        this.cityDb = cityDb;
        this.routeDb = routeDb;
        this.gameSessionDb = gameSessionDb;
        this.commandDb = commandDb;
        this.changeProvider = new ChangeProvider(
            gameSessionDb,
            tileDb,
            commandDb,
        );
    }

    public initialize(): void {
        GameRenderConfig.initialize();
        this.webGlRenderGraph = new GameWebGlRenderGraph(this.changeProvider, this.canvasHandle.getGL(), () => this.renderConfig!, this.tileDb, this.routeDb, this.gameSessionDb, this.commandDb);
        this.webGlRenderGraph.initialize();
        this.htmlRenderGraph = new GameHtmlRenderGraph(this.changeProvider, this.tileDb, this.cityDb, this.gameSessionDb);
        this.htmlRenderGraph.initialize();
    }

    public render() {
        const camera = this.getRenderCamera();
        this.changeProvider.prepareFrame(camera);
        this.renderConfig = GameRenderConfig.load();
        this.webGlRenderGraph?.updateCamera(camera);
        this.webGlRenderGraph?.execute();
        this.htmlRenderGraph?.updateCamera(camera)
        this.htmlRenderGraph?.execute()
    }

    public dispose() {
        this.webGlRenderGraph?.dispose();
        this.webGlRenderGraph = null;
        this.htmlRenderGraph?.dispose();
        this.htmlRenderGraph = null;
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