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
import {RenderRepository} from "./renderer/game/renderRepository";
import {WorldObjectDatabase} from "./state/database/objectDatabase";
import {MovementService} from "./game/movementService";
import {CommandService} from "./game/commandService";
import {CommandDatabase} from "./state/database/commandDatabase";
import {GameClient} from "./game/gameClient";
import {GameIdProvider} from "./gamesession/gameIdProvider";
import {CountryDatabase} from "./state/database/countryDatabase";
import {SettlementService} from "./game/settlementService";


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
    MovementService: () => MovementService,
    CommandService: () => CommandService,
    GameRepository: () => GameRepository,
    GameClient: () => GameClient,
    GameIdProvider: () => GameIdProvider,
    SettlementService: () => SettlementService,

    GameRenderer: () => GameRenderer,
    RenderRepository: () => RenderRepository,

    MonitoringRepository: () => MonitoringRepository,
    WebGLMonitor: () => WebGLMonitor,

    CameraDatabase: () => CameraDatabase,
    GameSessionDatabase: () => GameSessionDatabase,
    TileDatabase: () => TileDatabase,
    WorldObjectDatabase: () => WorldObjectDatabase,
    CommandDatabase: () => CommandDatabase,
    CountryDatabase: () => CountryDatabase,

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
        () => new TurnEndService(
            AppCtx.GameSessionService(),
            AppCtx.GameRepository(),
            AppCtx.MovementService()
        ),
    ),
    GameLoopService: diContext.register(
        "GameLoopService",
        () => new GameLoopService(
            AppCtx.MovementService(),
            new TilePicker(AppCtx.GameRepository()),
            AppCtx.GameRepository(),
            AppCtx.GameRenderer(),
            AppCtx.AudioService(),
        ),
    ),
    MovementService: diContext.register(
        "MovementService",
        () => new MovementService(
            AppCtx.CommandService(),
            AppCtx.GameClient(),
            AppCtx.GameRepository(),
        ),
    ),
    CommandService: diContext.register(
        "CommandService",
        () => new CommandService(
            AppCtx.GameRepository(),
            AppCtx.AudioService(),
        )
    ),
    GameClient: diContext.register(
        "GameClient",
        () => new GameClient(
            AppCtx.AuthProvider(),
            AppCtx.GameIdProvider(),
            AppCtx.HttpClient()
        )
    ),
    GameIdProvider: diContext.register(
        "GameIdProvider",
        () => new GameIdProvider(),
    ),
    SettlementService: diContext.register(
        "SettlementService",
        () => new SettlementService(
            AppCtx.CommandService()
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
            AppCtx.TileDatabase(),
            AppCtx.WorldObjectDatabase(),
            AppCtx.CommandDatabase(),
        )
    ),

    GameRepository: diContext.register(
        "GameRepository",
        () => new GameRepository(
            AppCtx.GameSessionDatabase(),
            AppCtx.CameraDatabase(),
            AppCtx.TileDatabase(),
            AppCtx.WorldObjectDatabase(),
            AppCtx.CommandDatabase(),
            AppCtx.CountryDatabase()
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
    WorldObjectDatabase: diContext.register(
        "WorldObjectDatabase",
        () => new WorldObjectDatabase(),
    ),
    CommandDatabase: diContext.register(
        "CommandDatabase",
        () => new CommandDatabase(),
    ),
    CountryDatabase: diContext.register(
        "CountryDatabase",
        () => new CountryDatabase(),
    ),

};

diContext.initialize();
