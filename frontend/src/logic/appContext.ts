import {createDiContainer, qualifier} from "../shared/di";
import {UserService} from "./user/userService";
import {UserRepository} from "./user/userRepository";
import {UserClient} from "./user/userClient";
import {AuthProvider} from "./authProvider";
import {HttpClient} from "../shared/httpClient";
import {GameSessionService} from "./gamesession/gameSessionService";
import {GameSessionClient} from "./gamesession/gameSessionClient";
import {GameSessionRepository} from "./gamesession/gameSessionRepository";
import {WebsocketClient} from "../shared/websocketClient";
import {WebsocketMessageHandler} from "../shared/websocketMessageHandler";
import {GameService} from "./game/gameService";
import {CommandService} from "./game/commandService";
import {GameRepository} from "./game/gameRepository";
import {CityCreationService} from "./game/cityCreationService";

const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;


export namespace AppCtx {

    console.log("Initializing application context");

    export const DIQ = {
        HttpClient: qualifier<HttpClient>("HttpClient"),
        WebsocketClient: qualifier<WebsocketClient>("WebsocketClient"),
        WebsocketMessageHandler: qualifier<WebsocketMessageHandler>("WebsocketMessageHandler"),
        AuthProvider: qualifier<AuthProvider>("AuthProvider"),
        UserRepository: qualifier<UserRepository>("UserRepository"),
        UserService: qualifier<UserService>("UserService"),
        GameSessionService: qualifier<GameSessionService>("GameSessionService"),
        GameRepository: qualifier<GameRepository>("GameRepository"),
        GameService: qualifier<GameService>("GameService"),
        CommandService: qualifier<CommandService>("CommandService"),
        CityCreationService: qualifier<CityCreationService>("CityCreationService"),
        GameSessionClient: qualifier<GameSessionClient>("GameSessionClient"),

    };

    const diContainer = createDiContainer();

    diContainer.bind(DIQ.HttpClient, ctx => new HttpClient(API_BASE_URL));
    diContainer.bind(DIQ.WebsocketClient, ctx => new WebsocketClient(API_WS_BASE_URL));
    diContainer.bind(DIQ.WebsocketMessageHandler, ctx => WebsocketMessageHandler.NOOP);
    diContainer.bind(DIQ.AuthProvider, ctx => new AuthProvider(ctx.get(DIQ.UserRepository)));

    diContainer.bind(DIQ.UserRepository, ctx => new UserRepository());
    diContainer.bind(DIQ.UserService, ctx => new UserService(
        ctx.get(DIQ.UserRepository),
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
    ))
    diContainer.bind(DIQ.GameSessionService, ctx => new GameSessionService(
        ctx.get(DIQ.GameSessionClient),
        new GameSessionRepository(),
    ));
    diContainer.bind(DIQ.GameRepository, ctx => new GameRepository())
    diContainer.bind(DIQ.GameService, ctx => new GameService(
        ctx.get(DIQ.GameRepository),
        ctx.get(DIQ.GameSessionClient)
    ))
    diContainer.bind(DIQ.CommandService, ctx => new CommandService(
        ctx.get(DIQ.GameRepository)
    ))

    diContainer.bind(DIQ.CityCreationService, ctx => new CityCreationService(
        ctx.get(DIQ.CommandService),
        ctx.get(DIQ.GameRepository)
    ))

    diContainer.createEager();
    export const di = diContainer.getContext();
}