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


const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;


const diContext = new DIContext();

export interface AppCtxDef {
    HttpClient: () => HttpClient,
    WebsocketClient: () => WebsocketClient,
    GameSessionMessageHandler: () => GameSessionMessageHandler,
    AuthProvider: () => AuthProvider,
    CanvasHandle: () => CanvasHandle,
    NextTurnService: () => NextTurnService,
    UserClient: () => UserClient,
    UserService: () => UserService,
    GameSessionClient: () => GameSessionClient,
    GameSessionService: () => GameSessionService,
    EndTurnService: () => EndTurnService,
    CommandService: () => CommandService,
    CityCreationService: () => CityCreationService,
    CityUpgradeService: () => CityUpgradeService,
    GameLoopService: () => GameLoopService,
    GameRenderer: () => GameRenderer,
}


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
    AuthProvider: diContext.register(
        "AuthProvider",
        () => new AuthProvider(),
    ),
    CanvasHandle: diContext.register(
        "CanvasHandle",
        () => new CanvasHandle(),
    ),
    NextTurnService: diContext.register(
        "NextTurnService",
        () => new NextTurnService(AppCtx.GameLoopService()),
    ),
    UserClient: diContext.register(
        "UserClient",
        () => new UserClient(AppCtx.AuthProvider(), AppCtx.HttpClient()),
    ),
    UserService: diContext.register(
        "UserService",
        () => new UserService(AppCtx.UserClient()),
    ),
    GameSessionClient: diContext.register(
        "GameSessionClient",
        () => new GameSessionClient(AppCtx.AuthProvider(), AppCtx.HttpClient(), AppCtx.WebsocketClient(), AppCtx.GameSessionMessageHandler()),
    ),
    GameSessionService: diContext.register(
        "GameSessionService",
        () => new GameSessionService(AppCtx.GameSessionClient()),
    ),
    EndTurnService: diContext.register(
        "EndTurnService",
        () => new EndTurnService(AppCtx.GameSessionClient()),
    ),
    CommandService: diContext.register(
        "CommandService",
        () => new CommandService(),
    ),
    CityCreationService: diContext.register(
        "CityCreationService",
        () => new CityCreationService(AppCtx.CommandService(), AppCtx.UserService()),
    ),
    CityUpgradeService: diContext.register(
        "CityUpgradeService",
        () => new CityUpgradeService(AppCtx.CommandService(), AppCtx.UserService()),
    ),
    GameLoopService: diContext.register(
        "GameLoopService",
        () => new GameLoopService(AppCtx.CanvasHandle(), AppCtx.GameRenderer()),
    ),
    GameRenderer: diContext.register(
        "GameRenderer",
        () => new GameRenderer(AppCtx.CanvasHandle()),
    ),
};

diContext.initialize();
