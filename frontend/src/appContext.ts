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
import {CommandService} from "./logic/game/commandService";
import {CityCreationService} from "./logic/game/cityCreationService";
import {GameLoopService} from "./logic/game/gameLoopService";
import {CityUpgradeService} from "./logic/game/cityUpgradeService";
import {GameSessionMessageHandler} from "./logic/gamesession/gameSessionMessageHandler";
import {UserClient} from "./logic/user/userClient";
import {UserRepository} from "./state/UserRepository";
import {TilePicker} from "./logic/game/tilePicker";
import {AudioService} from "./logic/audio/audioService";
import {DataViewService} from "./logic/game/dataViewService";
import {RenderEntityCollector} from "./renderer/data/builders/entities/renderEntityCollector";
import {RenderDataManager} from "./renderer/data/renderDataManager";
import {GameRenderer} from "./renderer/gameRenderer";
import {WebGLMonitor} from "./shared/webgl/monitor/webGLMonitor";
import {MonitoringRepository} from "./state/MonitoringRepository";
import {RenderDataUpdater} from "./renderer/data/renderDataUpdater";
import {CameraDatabase} from "./state/cameraDatabase";
import {CityDatabase} from "./state/cityDatabase";
import {CommandDatabase} from "./state/commandDatabase";
import {CountryDatabase} from "./state/countryDatabase";
import {GameSessionDatabase} from "./state/gameSessionDatabase";
import {LocalGameDatabase} from "./state/localGameDatabase";
import {ProvinceDatabase} from "./state/provinceDatabase";
import {RouteDatabase} from "./state/routeDatabase";
import {TileDatabase} from "./state/tileDatabase";


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

    DataViewService: () => DataViewService;
    NextTurnService: () => NextTurnService,
    EndTurnService: () => EndTurnService,
    CommandService: () => CommandService,
    CityCreationService: () => CityCreationService,
    CityUpgradeService: () => CityUpgradeService,
    GameLoopService: () => GameLoopService,

    WebGLMonitor: () => WebGLMonitor,
    GameRenderer: () => GameRenderer,
    RenderEntityCollector: () => RenderEntityCollector,
    RenderDataUpdater: () => RenderDataUpdater,
    RenderDataManager: () => RenderDataManager,

    CanvasHandle: () => CanvasHandle,

    MonitoringRepository: () => MonitoringRepository,
    UserRepository: () => UserRepository,

    CameraDatabase: () => CameraDatabase,
    CityDatabase: () => CityDatabase,
    CommandDatabase: () => CommandDatabase,
    CountryDatabase: () => CountryDatabase,
    GameSessionDatabase: () => GameSessionDatabase,
    LocalGameDatabase: () => LocalGameDatabase,
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


    DataViewService: diContext.register(
        "ModifiedAccessService",
        () => new DataViewService(AppCtx.UserService(), AppCtx.CountryDatabase(), AppCtx.RouteDatabase()),
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
        () => new EndTurnService(AppCtx.GameSessionClient(), AppCtx.CommandDatabase()),
    ),
    CommandService: diContext.register(
        "CommandService",
        () => new CommandService(AppCtx.CommandDatabase()),
    ),
    CityCreationService: diContext.register(
        "CityCreationService",
        () => new CityCreationService(
            AppCtx.CommandService(),
            AppCtx.UserService(),
            AppCtx.GameSessionDatabase(),
            AppCtx.CommandDatabase(),
            AppCtx.CountryDatabase(),
        ),
    ),
    CityUpgradeService: diContext.register(
        "CityUpgradeService",
        () => new CityUpgradeService(
            AppCtx.CommandService(),
            AppCtx.UserService(),
            AppCtx.CountryDatabase(),
            AppCtx.ProvinceDatabase(),
            AppCtx.CityDatabase(),
            AppCtx.CommandDatabase(),
        ),
    ),
    GameLoopService: diContext.register(
        "GameLoopService",
        () => new GameLoopService(
            AppCtx.CanvasHandle(),
            new TilePicker(AppCtx.CanvasHandle(), AppCtx.CameraDatabase(), AppCtx.TileDatabase()),
            AppCtx.CameraDatabase(),
            AppCtx.GameSessionDatabase(),
            AppCtx.LocalGameDatabase(),
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
            AppCtx.WebGLMonitor(),
            AppCtx.MonitoringRepository(),
            AppCtx.CameraDatabase(),
            AppCtx.RenderDataManager(),
        ),
    ),
    RenderEntityCollector: diContext.register(
        "RenderEntityCollector",
        () => new RenderEntityCollector(
            AppCtx.TileDatabase(),
            AppCtx.CityDatabase(),
            AppCtx.CommandDatabase(),
        ),
    ),
    RenderDataUpdater: diContext.register(
        "RenderDataUpdater",
        () => new RenderDataUpdater(
            AppCtx.GameSessionDatabase(),
            AppCtx.TileDatabase(),
            AppCtx.RouteDatabase(),
            AppCtx.LocalGameDatabase(),
            AppCtx.CommandDatabase(),
            AppCtx.RenderEntityCollector(),
        ),
    ),
    RenderDataManager: diContext.register(
        "RenderDataManager",
        () => new RenderDataManager(
            AppCtx.CanvasHandle(),
            AppCtx.RenderDataUpdater(),
        ),
    ),


    CanvasHandle: diContext.register(
        "CanvasHandle",
        () => new CanvasHandle(),
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
    LocalGameDatabase: diContext.register(
        "LocalGameDatabase",
        () => new LocalGameDatabase(),
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
