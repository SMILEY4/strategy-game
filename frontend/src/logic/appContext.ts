import {createDiContainer, qualifier} from "../shared/di";
import {UserService} from "./user/userService";
import {UserClient} from "./user/userClient";
import {AuthProvider} from "./authProvider";
import {HttpClient} from "../shared/httpClient";
import {GameSessionService} from "./gamesession/gameSessionService";
import {GameSessionClient} from "./gamesession/gameSessionClient";
import {WebsocketClient} from "../shared/websocketClient";
import {WebsocketMessageHandler} from "../shared/websocketMessageHandler";
import {EndTurnService} from "./game/endTurnService";
import {CommandService} from "./game/commandService";
import {CityCreationService} from "./game/cityCreationService";
import {GameSessionMessageHandler} from "./gamesession/gameSessionMessageHandler";
import {NextTurnService} from "./game/nextTurnService";
import {GameLoopService} from "./game/gameLoopService";
import {GameRenderer} from "./renderer/gameRenderer";
import {CanvasHandle} from "./game/canvasHandle";
import {CityUpgradeService} from "./game/cityUpgradeService";

const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;


export namespace AppCtx {

    console.log("Initializing application context");

    export const DIQ = {
        HttpClient: qualifier<HttpClient>("HttpClient"),
        WebsocketClient: qualifier<WebsocketClient>("WebsocketClient"),
        WebsocketMessageHandler: qualifier<WebsocketMessageHandler>("WebsocketMessageHandler"),
        AuthProvider: qualifier<AuthProvider>("AuthProvider"),
        UserService: qualifier<UserService>("UserService"),
        GameSessionService: qualifier<GameSessionService>("GameSessionService"),
        GameService: qualifier<EndTurnService>("GameService"),
        CommandService: qualifier<CommandService>("CommandService"),
        CityCreationService: qualifier<CityCreationService>("CityCreationService"),
        CityUpgradeService: qualifier<CityUpgradeService>("CityUpgradeService"),
        GameSessionClient: qualifier<GameSessionClient>("GameSessionClient"),
        NextTurnService: qualifier<NextTurnService>("NextTurnService"),
        GameLoopService: qualifier<GameLoopService>("GameLoopService"),
        GameRenderer: qualifier<GameRenderer>("GameRenderer"),
        CanvasHandle: qualifier<CanvasHandle>("CanvasHandle"),
    };

    const diContainer = createDiContainer();
    diContainer.bind(DIQ.HttpClient, ctx => new HttpClient(API_BASE_URL));
    diContainer.bind(DIQ.WebsocketClient, ctx => new WebsocketClient(API_WS_BASE_URL));
    diContainer.bind(DIQ.WebsocketMessageHandler, ctx => new GameSessionMessageHandler(
        ctx.get(DIQ.NextTurnService),
    ));
    diContainer.bind(DIQ.AuthProvider, ctx => new AuthProvider());

    diContainer.bind(DIQ.CanvasHandle, ctx => new CanvasHandle());

    diContainer.bind(DIQ.NextTurnService, ctx => new NextTurnService(
        ctx.get(DIQ.GameLoopService),
    ));
    diContainer.bind(DIQ.UserService, ctx => new UserService(
        new UserClient(
            ctx.get(DIQ.AuthProvider),
            ctx.get(DIQ.HttpClient),
        ),
    ));
    diContainer.bind(DIQ.GameSessionClient, ctx => new GameSessionClient(
        ctx.get(DIQ.AuthProvider),
        ctx.get(DIQ.HttpClient),
        ctx.get(DIQ.WebsocketClient),
        ctx.get(DIQ.WebsocketMessageHandler),
    ));
    diContainer.bind(DIQ.GameSessionService, ctx => new GameSessionService(
        ctx.get(DIQ.GameSessionClient),
    ));
    diContainer.bind(DIQ.GameService, ctx => new EndTurnService(
        ctx.get(DIQ.GameSessionClient),
    ));
    diContainer.bind(DIQ.CommandService, ctx => new CommandService());

    diContainer.bind(DIQ.CityCreationService, ctx => new CityCreationService(
        ctx.get(DIQ.CommandService),
        ctx.get(DIQ.UserService),
    ));
    diContainer.bind(DIQ.CityUpgradeService, ctx => new CityUpgradeService(
        ctx.get(DIQ.CommandService),
        ctx.get(DIQ.UserService),
    ));
    diContainer.bind(DIQ.GameLoopService, ctx => new GameLoopService(
        ctx.get(DIQ.CanvasHandle),
        ctx.get(DIQ.GameRenderer),
    ));
    diContainer.bind(DIQ.GameRenderer, ctx => new GameRenderer(
        ctx.get(DIQ.CanvasHandle),
    ));

    diContainer.createEager();
    export const di = diContainer.getContext();
}