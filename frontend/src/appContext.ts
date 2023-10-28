import {DIContext} from "./shared/di";
import {HttpClient} from "./shared/httpClient";
import {WebsocketClient} from "./shared/websocketClient";
import {AuthProvider} from "./logic/user/authProvider";
import {CanvasHandle} from "./logic/game/canvasHandle";
import {NextTurnService} from "./logic/game/nextTurnService";
import {UserService} from "./logic/user/userService";
import {GameSessionClient} from "./logic/gamesession/gameSessionClient";
import {GameSessionService} from "./logic/gamesession/gameSessionService";
import {EndTurnService} from "./logic/game/endTurnService";
import {CommandService} from "./logic/game/commandService";
import {CityCreationService} from "./logic/game/cityCreationService";
import {GameRenderer} from "./logic/renderer/gameRenderer";
import {GameLoopService} from "./logic/game/gameLoopService";
import {CityUpgradeService} from "./logic/game/cityUpgradeService";
import {GameSessionMessageHandler} from "./logic/gamesession/gameSessionMessageHandler";
import {UserClient} from "./logic/user/userClient";
import {UserRepository} from "./state/access/UserRepository";
import {CameraRepository} from "./state/access/CameraRepository";
import {CommandRepository} from "./state/access/CommandRepository";
import {GameSessionStateRepository} from "./state/access/GameSessionStateRepository";
import {GameConfigRepository} from "./state/access/GameConfigRepository";
import {CountryRepository} from "./state/access/CountryRepository";
import {ProvinceRepository} from "./state/access/ProvinceRepository";
import {CityRepository} from "./state/access/CityRepository";
import {TileRepository} from "./state/access/TileRepository";
import {RemoteGameStateRepository} from "./state/access/RemoteGameStateRepository";
import {TilePicker} from "./logic/game/tilePicker";
import {WorldUpdater} from "./logic/renderer/world/worldUpdater";
import {MapModeRepository} from "./state/access/MapModeRepository";


const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;


interface AppCtxDef {
    HttpClient: () => HttpClient,
    WebsocketClient: () => WebsocketClient,

    GameSessionMessageHandler: () => GameSessionMessageHandler,
    GameSessionClient: () => GameSessionClient,
    GameSessionService: () => GameSessionService,

    AuthProvider: () => AuthProvider,
    UserClient: () => UserClient,
    UserService: () => UserService,

    NextTurnService: () => NextTurnService,
    EndTurnService: () => EndTurnService,
    CommandService: () => CommandService,
    CityCreationService: () => CityCreationService,
    CityUpgradeService: () => CityUpgradeService,
    GameLoopService: () => GameLoopService,

    CanvasHandle: () => CanvasHandle,
    GameRenderer: () => GameRenderer,

    UserRepository: () => UserRepository,
    CameraRepository: () => CameraRepository,
    CommandRepository: () => CommandRepository,
    GameSessionStateRepository: () => GameSessionStateRepository,
    GameConfigRepository: () => GameConfigRepository,
    RemoteGameStateRepository: () => RemoteGameStateRepository,
    CountryRepository: () => CountryRepository,
    ProvinceRepository: () => ProvinceRepository,
    CityRepository: () => CityRepository,
    TileRepository: () => TileRepository,
    MapModeRepository: () => MapModeRepository,
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
        () => new GameSessionService(AppCtx.GameSessionClient(), AppCtx.GameSessionStateRepository(), AppCtx.GameConfigRepository()),
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
        () => new NextTurnService(AppCtx.GameLoopService(), AppCtx.RemoteGameStateRepository()),
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
        () => new CityCreationService(AppCtx.CommandService(), AppCtx.UserService(), AppCtx.GameConfigRepository(), AppCtx.CountryRepository()),
    ),
    CityUpgradeService: diContext.register(
        "CityUpgradeService",
        () => new CityUpgradeService(AppCtx.CommandService(), AppCtx.UserService(), AppCtx.CountryRepository(), AppCtx.ProvinceRepository(), AppCtx.CityRepository()),
    ),
    GameLoopService: diContext.register(
        "GameLoopService",
        () => new GameLoopService(
            AppCtx.CanvasHandle(),
            AppCtx.GameRenderer(),
            new TilePicker(AppCtx.CanvasHandle(), AppCtx.CameraRepository(), AppCtx.TileRepository()),
            AppCtx.CameraRepository(),
            AppCtx.GameSessionStateRepository(),
            AppCtx.TileRepository(),
        ),
    ),



    CanvasHandle: diContext.register(
        "CanvasHandle",
        () => new CanvasHandle(),
    ),
    GameRenderer: diContext.register(
        "GameRenderer",
        () => new GameRenderer(
            AppCtx.CanvasHandle(),
            new WorldUpdater(AppCtx.CanvasHandle(), AppCtx.CommandRepository(), AppCtx.CityRepository(), AppCtx.TileRepository()),
            AppCtx.CameraRepository(),
            AppCtx.CommandRepository(),
            AppCtx.MapModeRepository(),
            AppCtx.TileRepository(),
        ),
    ),



    UserRepository: diContext.register(
        "UserRepository",
        () => new UserRepository(),
    ),
    CameraRepository: diContext.register(
        "CameraRepository",
        () => new CameraRepository(),
    ),
    CommandRepository: diContext.register(
        "CommandRepository",
        () => new CommandRepository(),
    ),
    GameSessionStateRepository: diContext.register(
        "GameSessionStateRepository",
        () => new GameSessionStateRepository(),
    ),
    GameConfigRepository: diContext.register(
        "GameConfigRepository",
        () => new GameConfigRepository(),
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
        () => new MapModeRepository(AppCtx.RemoteGameStateRepository()),
    ),
};

diContext.initialize();