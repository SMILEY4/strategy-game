import {DIContext} from "./shared/dependencyinjection/di";
import {HttpClient} from "./shared/httpClient";
import {WebsocketClient} from "./shared/websocketClient";
import {AuthProvider} from "./user/authProvider";
import {CanvasHandle} from "./shared/webgl/canvasHandle";
import {TurnStartService} from "./game/turnStartService";
import {UserService} from "./user/userService";
import {GameSessionClient} from "./gamesession/gameSessionClient";
import {GameSessionService} from "./gamesession/gameSessionService";
import {GameLoopService} from "./game/gameLoopService";
import {UserClient} from "./user/userClient";
import {TilePicker} from "./game/tilePicker";
import {AudioService} from "./shared/audioService";
import {WebGLMonitor} from "./shared/webgl/monitor/webGLMonitor";
import {CameraDatabase} from "./state/database/cameraDatabase";
import {GameSessionDatabase} from "./state/database/gameSessionDatabase";
import {TileDatabase} from "./state/database/tileDatabase";
import {MonitoringRepository} from "./state/database/monitoringRepository";
import {UserRepository} from "./user/userRepository";
import {GameRenderer} from "./renderer/game/gameRenderer";
import {GameRepository} from "./game/gameRepository";
import {GameSessionRepository} from "./gamesession/gameSessionRepository";
import {TurnEndService} from "./game/turnEndService";
import {RenderRepository} from "./renderer/game/RenderRepository";


const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;


interface AppCtxDef {
    HttpClient: () => HttpClient,
    WebsocketClient: () => WebsocketClient,
    AudioService: () => AudioService,

    GameSessionClient: () => GameSessionClient,
    GameSessionService: () => GameSessionService,
    GameSessionRepository: () => GameSessionRepository,

    UserClient: () => UserClient,
    UserService: () => UserService,
    UserRepository: () => UserRepository,
    AuthProvider: () => AuthProvider,

    TurnStartService: () => TurnStartService,
    TurnEndService: () => TurnEndService,
    GameLoopService: () => GameLoopService,
    GameRepository: () => GameRepository,

    GameRenderer: () => GameRenderer,
    RenderRepository: () => RenderRepository,

    MonitoringRepository: () => MonitoringRepository,
    WebGLMonitor: () => WebGLMonitor,

    CameraDatabase: () => CameraDatabase,
    GameSessionDatabase: () => GameSessionDatabase,
    TileDatabase: () => TileDatabase,
}

const diContext = new DIContext();

export const AppCtx: AppCtxDef = {

    HttpClient: diContext.register(
        "HttpClient",
        () => new HttpClient(API_BASE_URL),
    ),
    WebsocketClient: diContext.register(
        "WebsocketClient",
        () => new WebsocketClient(API_WS_BASE_URL),
    ),
    AudioService: diContext.register(
        "AudioService",
        () => new AudioService(),
        {
            creation: "eager",
            lifetime: "singleton",
        },
    ),


    GameSessionClient: diContext.register(
        "GameSessionClient",
        () => new GameSessionClient(AppCtx.AuthProvider(), AppCtx.HttpClient(), AppCtx.WebsocketClient()),
    ),
    GameSessionService: diContext.register(
        "GameSessionService",
        () => new GameSessionService(AppCtx.GameSessionClient(), AppCtx.GameSessionRepository(), AppCtx.TurnStartService()),
    ),
    GameSessionRepository: diContext.register(
        "GameSessionRepository",
        () => new GameSessionRepository(AppCtx.GameSessionDatabase()),
    ),


    AuthProvider: diContext.register(
        "AuthProvider",
        () => new AuthProvider(AppCtx.UserRepository()),
    ),
    UserClient: diContext.register(
        "UserClient",
        () => new UserClient(AppCtx.AuthProvider(), AppCtx.HttpClient()),
    ),
    UserService: diContext.register(
        "UserService",
        () => new UserService(AppCtx.UserClient(), AppCtx.UserRepository()),
    ),


    TurnStartService: diContext.register(
        "TurnStartService",
        () => new TurnStartService(
            AppCtx.GameRepository(),
            AppCtx.MonitoringRepository(),
        ),
    ),
    TurnEndService: diContext.register(
        "EndTurnService",
        () => new TurnEndService(AppCtx.GameSessionService()),
    ),
    GameLoopService: diContext.register(
        "GameLoopService",
        () => new GameLoopService(
            new TilePicker(AppCtx.GameRepository()),
            AppCtx.GameRepository(),
            AppCtx.GameRenderer(),
            AppCtx.AudioService(),
        ),
    ),

    WebGLMonitor: diContext.register(
        "WebGLMonitor",
        () => new WebGLMonitor(),
    ),
    GameRenderer: diContext.register(
        "GameRenderer",
        () => new GameRenderer(
            AppCtx.RenderRepository(),
        ),
    ),
    RenderRepository: diContext.register(
        "RenderRepository",
        () => new RenderRepository(
            AppCtx.GameSessionDatabase(),
            AppCtx.CameraDatabase(),
            AppCtx.TileDatabase()
        )
    ),

    GameRepository: diContext.register(
        "GameRepository",
        () => new GameRepository(
            AppCtx.GameSessionDatabase(),
            AppCtx.CameraDatabase(),
            AppCtx.TileDatabase()
        )
    ),
    MonitoringRepository: diContext.register(
        "MonitoringRepository",
        () => new MonitoringRepository(),
    ),
    UserRepository: diContext.register(
        "UserRepository",
        () => new UserRepository(),
    ),
    CameraDatabase: diContext.register(
        "CameraRepository",
        () => new CameraDatabase(),
    ),
    GameSessionDatabase: diContext.register(
        "GameSessionDatabase",
        () => new GameSessionDatabase(),
    ),
    TileDatabase: diContext.register(
        "TileDatabase",
        () => new TileDatabase(),
    ),

};

diContext.initialize();
