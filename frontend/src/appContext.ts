import {DIContext} from "./shared/dependencyinjection/di";
import {HttpClient} from "./shared/httpClient";
import {WebsocketClient} from "./shared/websocketClient";
import {AuthProvider} from "./logic/user/authProvider";
import {CanvasHandle} from "./shared/webgl/canvasHandle";
import {NextTurnService} from "./logic/game/nextTurnService";
import {UserService} from "./logic/user/userService";
import {GameSessionClient} from "./logic/gamesession/gameSessionClient";
import {GameSessionService} from "./logic/gamesession/gameSessionService";
import {EndTurnService} from "./logic/game/endTurnService";
import {GameLoopService} from "./logic/game/gameLoopService";
import {GameSessionMessageHandler} from "./logic/gamesession/gameSessionMessageHandler";
import {UserClient} from "./logic/user/userClient";
import {TilePicker} from "./logic/game/tilePicker";
import {AudioService} from "./logic/audio/audioService";
import {WebGLMonitor} from "./shared/webgl/monitor/webGLMonitor";
import {CameraDatabase} from "./state/database/cameraDatabase";
import {CityDatabase} from "./state/database/cityDatabase";
import {CommandDatabase} from "./state/database/commandDatabase";
import {CountryDatabase} from "./state/database/countryDatabase";
import {GameSessionDatabase} from "./state/database/gameSessionDatabase";
import {ProvinceDatabase} from "./state/database/provinceDatabase";
import {RouteDatabase} from "./state/database/routeDatabase";
import {TileDatabase} from "./state/database/tileDatabase";
import {MonitoringRepository} from "./state/database/monitoringRepository";
import {UserRepository} from "./state/database/userRepository";
import {GameRenderer} from "./renderer/game/gameRenderer";
import {GameRepository} from "./state/gameRepository";


const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;


interface AppCtxDef {
    HttpClient: () => HttpClient,
    WebsocketClient: () => WebsocketClient,
    AudioService: () => AudioService,

    GameSessionMessageHandler: () => GameSessionMessageHandler,
    GameSessionClient: () => GameSessionClient,
    GameSessionService: () => GameSessionService,

    AuthProvider: () => AuthProvider,
    UserClient: () => UserClient,
    UserService: () => UserService,

    NextTurnService: () => NextTurnService,
    EndTurnService: () => EndTurnService,
    GameLoopService: () => GameLoopService,

    WebGLMonitor: () => WebGLMonitor,
    GameRenderer: () => GameRenderer,

    CanvasHandle: () => CanvasHandle,

    MonitoringRepository: () => MonitoringRepository,
    UserRepository: () => UserRepository,

    GameRepository: () => GameRepository,
    CameraDatabase: () => CameraDatabase,
    CityDatabase: () => CityDatabase,
    CommandDatabase: () => CommandDatabase,
    CountryDatabase: () => CountryDatabase,
    GameSessionDatabase: () => GameSessionDatabase,
    ProvinceDatabase: () => ProvinceDatabase,
    RouteDatabase: () => RouteDatabase,
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


    GameSessionMessageHandler: diContext.register(
        "GameSessionMessageHandler",
        () => new GameSessionMessageHandler(AppCtx.NextTurnService()),
    ),
    GameSessionClient: diContext.register(
        "GameSessionClient",
        () => new GameSessionClient(AppCtx.AuthProvider(), AppCtx.HttpClient(), AppCtx.WebsocketClient(), AppCtx.GameSessionMessageHandler()),
    ),
    GameSessionService: diContext.register(
        "GameSessionService",
        () => new GameSessionService(AppCtx.GameSessionClient(), AppCtx.GameSessionDatabase()),
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


    NextTurnService: diContext.register(
        "NextTurnService",
        () => new NextTurnService(
            AppCtx.GameLoopService(),
            AppCtx.GameSessionDatabase(),
            AppCtx.MonitoringRepository(),
            AppCtx.CityDatabase(),
            AppCtx.CountryDatabase(),
            AppCtx.ProvinceDatabase(),
            AppCtx.RouteDatabase(),
            AppCtx.TileDatabase(),
        ),
    ),
    EndTurnService: diContext.register(
        "EndTurnService",
        () => new EndTurnService(AppCtx.GameSessionClient()),
    ),
    GameLoopService: diContext.register(
        "GameLoopService",
        () => new GameLoopService(
            AppCtx.CanvasHandle(),
            new TilePicker(AppCtx.CanvasHandle(), AppCtx.CameraDatabase(), AppCtx.TileDatabase()),
            AppCtx.CameraDatabase(),
            AppCtx.GameSessionDatabase(),
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
            AppCtx.CanvasHandle(),
            AppCtx.GameRepository(),
        ),
    ),

    CanvasHandle: diContext.register(
        "CanvasHandle",
        () => new CanvasHandle(),
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
    CityDatabase: diContext.register(
        "CityDatabase",
        () => new CityDatabase(),
    ),
    CommandDatabase: diContext.register(
        "CommandDatabase",
        () => new CommandDatabase(),
    ),
    CountryDatabase: diContext.register(
        "CountryDatabase",
        () => new CountryDatabase(),
    ),
    GameSessionDatabase: diContext.register(
        "GameSessionDatabase",
        () => new GameSessionDatabase(),
    ),
    ProvinceDatabase: diContext.register(
        "ProvinceDatabase",
        () => new ProvinceDatabase(),
    ),
    RouteDatabase: diContext.register(
        "RouteDatabase",
        () => new RouteDatabase(),
    ),
    TileDatabase: diContext.register(
        "TileDatabase",
        () => new TileDatabase(),
    ),

};

diContext.initialize();
