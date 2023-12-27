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
import {UserRepository} from "./state/access/UserRepository";
import {CommandRepository} from "./state/access/CommandRepository";
import {CountryRepository} from "./state/access/CountryRepository";
import {ProvinceRepository} from "./state/access/ProvinceRepository";
import {CityRepository} from "./state/access/CityRepository";
import {TileRepository} from "./state/access/TileRepository";
import {RemoteGameStateRepository} from "./state/access/RemoteGameStateRepository";
import {TilePicker} from "./logic/game/tilePicker";
import {MapModeRepository} from "./state/access/MapModeRepository";
import {AudioService} from "./logic/audio/audioService";
import {DataViewService} from "./logic/game/dataViewService";
import {RouteRepository} from "./state/access/RouteRepository";
import {RenderEntityCollector} from "./renderer/data/builders/entities/renderEntityCollector";
import {RenderDataManager} from "./renderer/data/renderDataManager";
import {GameRenderer} from "./renderer/gameRenderer";
import {WebGLMonitor} from "./shared/webgl/monitor/webGLMonitor";
import {MonitoringRepository} from "./state/access/MonitoringRepository";
import {RenderDataUpdater} from "./renderer/data/renderDataUpdater";
import {CameraDatabase} from "./state_new/cameraDatabase";
import {CityDatabase} from "./state_new/cityDatabase";
import {CommandDatabase} from "./state_new/commandDatabase";
import {CountryDatabase} from "./state_new/countryDatabase";
import {GameSessionDatabase} from "./state_new/gameSessionDatabase";
import {LocalGameDatabase} from "./state_new/localGameDatabase";
import {ProvinceDatabase} from "./state_new/provinceDatabase";
import {RouteDatabase} from "./state_new/routeDatabase";
import {TileDatabase} from "./state_new/tileDatabase";


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
    CommandRepository: () => CommandRepository,
    RemoteGameStateRepository: () => RemoteGameStateRepository,
    CountryRepository: () => CountryRepository,
    ProvinceRepository: () => ProvinceRepository,
    CityRepository: () => CityRepository,
    TileRepository: () => TileRepository,
    MapModeRepository: () => MapModeRepository,
    RouteRepository: () => RouteRepository,

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
        () => new DataViewService(AppCtx.UserService(), AppCtx.CountryRepository(), AppCtx.RouteRepository()),
    ),
    NextTurnService: diContext.register(
        "NextTurnService",
        () => new NextTurnService(
            AppCtx.GameLoopService(),
            AppCtx.RemoteGameStateRepository(),
            AppCtx.GameSessionDatabase(),
            AppCtx.MonitoringRepository(),
        ),
    ),
    EndTurnService: diContext.register(
        "EndTurnService",
        () => new EndTurnService(AppCtx.GameSessionClient(), AppCtx.CommandRepository()),
    ),
    CommandService: diContext.register(
        "CommandService",
        () => new CommandService(AppCtx.CommandRepository()),
    ),
    CityCreationService: diContext.register(
        "CityCreationService",
        () => new CityCreationService(AppCtx.CommandService(), AppCtx.UserService(), AppCtx.GameSessionDatabase(), AppCtx.CountryRepository(), AppCtx.CommandRepository()),
    ),
    CityUpgradeService: diContext.register(
        "CityUpgradeService",
        () => new CityUpgradeService(AppCtx.CommandService(), AppCtx.UserService(), AppCtx.CountryRepository(), AppCtx.ProvinceRepository(), AppCtx.CityRepository(), AppCtx.CommandRepository()),
    ),
    GameLoopService: diContext.register(
        "GameLoopService",
        () => new GameLoopService(
            AppCtx.CanvasHandle(),
            new TilePicker(AppCtx.CanvasHandle(), AppCtx.CameraDatabase(), AppCtx.TileRepository()),
            AppCtx.CameraDatabase(),
            AppCtx.GameSessionDatabase(),
            AppCtx.TileRepository(),
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
            AppCtx.TileRepository(),
            AppCtx.CityRepository(),
            AppCtx.CommandRepository(),
        ),
    ),
    RenderDataUpdater: diContext.register(
        "RenderDataUpdater",
        () => new RenderDataUpdater(
            AppCtx.RemoteGameStateRepository(),
            AppCtx.TileRepository(),
            AppCtx.RouteRepository(),
            AppCtx.MapModeRepository(),
            AppCtx.CommandRepository(),
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
    CommandRepository: diContext.register(
        "CommandRepository",
        () => new CommandRepository(),
    ),
    RemoteGameStateRepository: diContext.register(
        "RemoteGameStateRepository",
        () => new RemoteGameStateRepository(),
    ),
    CountryRepository: diContext.register(
        "CountryRepository",
        () => new CountryRepository(AppCtx.RemoteGameStateRepository()),
    ),
    ProvinceRepository: diContext.register(
        "ProvinceRepository",
        () => new ProvinceRepository(AppCtx.RemoteGameStateRepository()),
    ),
    CityRepository: diContext.register(
        "CityRepository",
        () => new CityRepository(AppCtx.RemoteGameStateRepository()),
    ),
    TileRepository: diContext.register(
        "TileRepository",
        () => new TileRepository(AppCtx.RemoteGameStateRepository()),
    ),
    MapModeRepository: diContext.register(
        "MapModeRepository",
        () => new MapModeRepository(),
    ),
    RouteRepository: diContext.register(
        "RouteRepository",
        () => new RouteRepository(AppCtx.RemoteGameStateRepository()),
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
