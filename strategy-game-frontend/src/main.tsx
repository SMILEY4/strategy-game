import React from "react";
import ReactDOM from "react-dom/client";
import {GameConnectAction} from "./core/gameConnectAction";
import {GameCreateAction} from "./core/gameCreateAction";
import {GameDisposeAction} from "./core/gameDisposeAction";
import {GameInitAction} from "./core/gameInitAction";
import {GameJoinAction} from "./core/gameJoinAction";
import {GameListAction} from "./core/gameListAction";
import {GameUpdateAction} from "./core/gameUpdateAction";
import {InputClickAction} from "./core/inputClickAction";
import {InputMouseMoveAction} from "./core/inputMouseMoveAction";
import {InputMouseScrollAction} from "./core/inputMouseScrollAction";
import {GameCanvasHandle} from "./core/rendering/gameCanvasHandle";
import {Renderer} from "./core/rendering/renderer";
import {GameApi} from "./core/required/gameApi";
import {GameConfigRepository} from "./core/required/gameConfigRepository";
import {GameRepository} from "./core/required/gameRepository";
import {UIService} from "./core/required/UIService";
import {UserApi} from "./core/required/userApi";
import {UserRepository} from "./core/required/userRepository";
import {WorldRepository} from "./core/required/worldRepository";
import {SetGameStateAction} from "./core/setGameStateAction";
import {TilePicker} from "./core/tilemap/tilePicker";
import {TurnAddCommandAction} from "./core/turnAddCommandAction";
import {TurnSubmitAction} from "./core/turnSubmitAction";
import {UserLoginAction} from "./core/userLoginAction";
import {UserLogOutAction} from "./core/userLogOutAction";
import {UserSignUpAction} from "./core/userSignUpAction";
import {GameApiImpl} from "./external/api/gameApiImpl";
import {HttpClient} from "./external/api/http/httpClient";
import {MessageHandler} from "./external/api/messageHandler";
import {WebsocketClient} from "./external/api/messaging/websocketClient";
import {UserApiImpl} from "./external/api/userApiImpl";
import {GameStateAccess} from "./external/state/game/gameStateAccess";
import {GameConfigStateAccess} from "./external/state/gameconfig/gameConfigStateAccess";
import {GameConfigRepositoryImpl} from "./external/state/gameConfigRepositoryImpl";
import {GameRepositoryImpl} from "./external/state/gameRepositoryImpl";
import {LocalGameStateAccess} from "./external/state/localgame/localGameStateAccess";
import {UIStateAccess} from "./external/state/ui/uiStateAccess";
import {UIServiceImpl} from "./external/state/uiServiceImpl";
import {UserStateAccess} from "./external/state/user/userStateAccess";
import {UserRepositoryImpl} from "./external/state/userRepositoryImpl";
import {WorldRepositoryImpl} from "./external/state/worldRepositoryImpl";
import {createDiContainer, qualifier} from "./shared/di";
import {App} from "./ui/App";
import "./ui/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <App/>
);
// !! Strict-Mode tells react to re-render components twice (calls useEffect 2x) in dev-mode !!
// ==> handle communication with logic outside react-lifecycle with care (or move strict-mode to "page"-level)
// ==> https://reactjs.org/docs/strict-mode.html

const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;

export namespace AppConfig {

    export const DIQ = {
        GameApi: qualifier<GameApi>("GameApi"),
        GameCanvasHandle: qualifier<GameCanvasHandle>("GameCanvasHandle"),
        GameConfigRepository: qualifier<GameConfigRepository>("GameConfigRepository"),
        GameConnectAction: qualifier<GameConnectAction>("GameConnectAction"),
        GameCreateAction: qualifier<GameCreateAction>("GameCreateAction"),
        GameDisposeAction: qualifier<GameDisposeAction>("GameDisposeAction"),
        GameInitAction: qualifier<GameInitAction>("GameInitAction"),
        GameJoinAction: qualifier<GameJoinAction>("GameJoinAction"),
        GameListAction: qualifier<GameListAction>("GameListAction"),
        GameRepository: qualifier<GameRepository>("GameRepository"),
        GameUpdateAction: qualifier<GameUpdateAction>("GameUpdateAction"),
        HttpClient: qualifier<HttpClient>("HttpClient"),
        InputClickAction: qualifier<InputClickAction>("InputClickAction"),
        InputMouseMoveAction: qualifier<InputMouseMoveAction>("InputMouseMoveAction"),
        InputMouseScrollAction: qualifier<InputMouseScrollAction>("InputMouseScrollAction"),
        MessageHandler: qualifier<MessageHandler>("MessageHandler"),
        Renderer: qualifier<Renderer>("Renderer"),
        SetGameStateAction: qualifier<SetGameStateAction>("SetGameStateAction"),
        TilePicker: qualifier<TilePicker>("TilePicker"),
        TurnAddCommandAction: qualifier<TurnAddCommandAction>("TurnAddCommandAction"),
        TurnSubmitAction: qualifier<TurnSubmitAction>("TurnSubmitAction"),
        UIService: qualifier<UIService>("UIService"),
        UserApi: qualifier<UserApi>("UserApi"),
        UserLoginAction: qualifier<UserLoginAction>("UserLoginAction"),
        UserLogOutAction: qualifier<UserLogOutAction>("UserLogOutAction"),
        UserRepository: qualifier<UserRepository>("UserRepository"),
        UserSignUpAction: qualifier<UserSignUpAction>("UserSignUpAction"),
        WebsocketClient: qualifier<WebsocketClient>("WebsocketClient"),
        WorldRepository: qualifier<WorldRepository>("WorldRepository"),
    };

    const diContainer = createDiContainer();
    diContainer.bind(DIQ.GameApi, ctx => new GameApiImpl(ctx.get(DIQ.HttpClient), ctx.get(DIQ.WebsocketClient), ctx.get(DIQ.MessageHandler), ctx.get(DIQ.UserRepository)));
    diContainer.bind(DIQ.GameCanvasHandle, ctx => new GameCanvasHandle());
    diContainer.bind(DIQ.GameConfigRepository, ctx => new GameConfigRepositoryImpl(new GameConfigStateAccess()));
    diContainer.bind(DIQ.GameConnectAction, ctx => new GameConnectAction(ctx.get(DIQ.GameApi), ctx.get(DIQ.GameRepository)));
    diContainer.bind(DIQ.GameCreateAction, ctx => new GameCreateAction(ctx.get(DIQ.GameApi)));
    diContainer.bind(DIQ.GameDisposeAction, ctx => new GameDisposeAction(ctx.get(DIQ.GameCanvasHandle), ctx.get(DIQ.Renderer)));
    diContainer.bind(DIQ.GameInitAction, ctx => new GameInitAction(ctx.get(DIQ.GameCanvasHandle), ctx.get(DIQ.Renderer)));
    diContainer.bind(DIQ.GameJoinAction, ctx => new GameJoinAction(ctx.get(DIQ.GameApi)));
    diContainer.bind(DIQ.GameListAction, ctx => new GameListAction(ctx.get(DIQ.GameApi)));
    diContainer.bind(DIQ.GameRepository, ctx => new GameRepositoryImpl(new LocalGameStateAccess()));
    diContainer.bind(DIQ.GameUpdateAction, ctx => new GameUpdateAction(ctx.get(DIQ.Renderer)));
    diContainer.bind(DIQ.HttpClient, ctx => new HttpClient(API_BASE_URL));
    diContainer.bind(DIQ.InputClickAction, ctx => new InputClickAction(ctx.get(DIQ.TilePicker), ctx.get(DIQ.GameRepository), ctx.get(DIQ.UIService)));
    diContainer.bind(DIQ.InputMouseMoveAction, ctx => new InputMouseMoveAction(ctx.get(DIQ.TilePicker), ctx.get(DIQ.GameRepository)));
    diContainer.bind(DIQ.InputMouseScrollAction, ctx => new InputMouseScrollAction(ctx.get(DIQ.GameRepository)));
    diContainer.bind(DIQ.MessageHandler, ctx => new MessageHandler(ctx.get(DIQ.SetGameStateAction)));
    diContainer.bind(DIQ.Renderer, ctx => new Renderer(ctx.get(DIQ.GameCanvasHandle), ctx.get(DIQ.GameRepository), ctx.get(DIQ.WorldRepository), ctx.get(DIQ.UserRepository)));
    diContainer.bind(DIQ.SetGameStateAction, ctx => new SetGameStateAction(ctx.get(DIQ.GameRepository), ctx.get(DIQ.WorldRepository)));
    diContainer.bind(DIQ.TilePicker, ctx => new TilePicker(ctx.get(DIQ.GameRepository), ctx.get(DIQ.WorldRepository), ctx.get(DIQ.GameCanvasHandle)));
    diContainer.bind(DIQ.TurnAddCommandAction, ctx => new TurnAddCommandAction(ctx.get(DIQ.GameRepository), ctx.get(DIQ.GameConfigRepository)));
    diContainer.bind(DIQ.TurnSubmitAction, ctx => new TurnSubmitAction(ctx.get(DIQ.GameRepository), ctx.get(DIQ.GameApi)));
    diContainer.bind(DIQ.UIService, ctx => new UIServiceImpl(new UIStateAccess()));
    diContainer.bind(DIQ.UserApi, ctx => new UserApiImpl(ctx.get(DIQ.HttpClient), ctx.get(DIQ.UserRepository)));
    diContainer.bind(DIQ.UserLoginAction, ctx => new UserLoginAction(ctx.get(DIQ.UserApi), ctx.get(DIQ.GameApi), ctx.get(DIQ.UserRepository), ctx.get(DIQ.GameConfigRepository)));
    diContainer.bind(DIQ.UserLogOutAction, ctx => new UserLogOutAction(ctx.get(DIQ.UserRepository)));
    diContainer.bind(DIQ.UserRepository, ctx => new UserRepositoryImpl(new UserStateAccess()));
    diContainer.bind(DIQ.UserSignUpAction, ctx => new UserSignUpAction(ctx.get(DIQ.UserApi)));
    diContainer.bind(DIQ.WebsocketClient, ctx => new WebsocketClient(API_WS_BASE_URL));
    diContainer.bind(DIQ.WorldRepository, ctx => new WorldRepositoryImpl(new GameStateAccess()));
    diContainer.createEager();

    export const di = diContainer.getContext();

    let extContext: any = null;

    export function debugLooseWebglContext() {
        const canvasHandle: GameCanvasHandle = AppConfig.di.get(DIQ.GameCanvasHandle);
        if (canvasHandle.getGL()) {
            extContext = canvasHandle.getGL().getExtension("WEBGL_lose_context");
            if (extContext) {
                console.log("Simulate loosing context");
                extContext.loseContext();
            }
        }
    }

    export function debugRestoreWebglContext() {
        if (extContext) {
            console.log("Simulate restoring context");
            extContext.restoreContext();
        }
    }

}
