import React from "react";
import ReactDOM from "react-dom/client";
import {GameConnectAction} from "./core/gameConnectAction";
import {GameCreateAction} from "./core/gameCreateAction";
import {GameDisposeAction} from "./core/gameDisposeAction";
import {GameInitAction} from "./core/gameInitAction";
import {GameJoinAction} from "./core/gameJoinAction";
import {GameUpdateAction} from "./core/gameUpdateAction";
import {InputClickAction} from "./core/inputClickAction";
import {InputMouseMoveAction} from "./core/inputMouseMoveAction";
import {InputMouseScrollAction} from "./core/inputMouseScrollAction";
import {GameCanvasHandle} from "./core/rendering/gameCanvasHandle";
import {Renderer} from "./core/rendering/renderer";
import {GameApi} from "./core/required/gameApi";
import {UserApi} from "./core/required/userApi";
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
import {LocalGameStateAccess} from "./external/state/localgame/localGameStateAccess";
import {UIStateAccess} from "./external/state/ui/uiStateAccess";
import {UserStateAccess} from "./external/state/user/userStateAccess";
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

    qualifier<GameApi>("GameApi")

    const Q = {
        LocalGameStateAccess: qualifier<LocalGameStateAccess>("LocalGameStateAccess"),
        UserStateAccess: qualifier<UserStateAccess>("UserStateAccess"),
        GameStateAccess: qualifier<GameStateAccess>("GameStateAccess"),
        GameConfigStateAccess: qualifier<GameConfigStateAccess>("GameConfigStateAccess"),
        UIStateAccess: qualifier<UIStateAccess>("UIStateAccess"),
        GameCanvasHandle: qualifier<GameCanvasHandle>("GameCanvasHandle"),
        Renderer: qualifier<Renderer>("Renderer"),
        TilePicker: qualifier<TilePicker>("TilePicker"),
        SetGameStateAction: qualifier<SetGameStateAction>("SetGameStateAction"),
        HttpClient: qualifier<HttpClient>("HttpClient"),
        WebsocketClient: qualifier<WebsocketClient>("WebsocketClient"),
        MessageHandler: qualifier<MessageHandler>("MessageHandler"),
        GameApi: qualifier<GameApi>("GameApi"),
        UserApi: qualifier<UserApi>("UserApi"),
        UserSignUpAction: qualifier<UserSignUpAction>("UserSignUpAction"),
        UserLoginAction: qualifier<UserLoginAction>("UserLoginAction"),
        UserLogOutAction: qualifier<UserLogOutAction>("UserLogOutAction"),
        GameCreateAction: qualifier<GameCreateAction>("GameCreateAction"),
        GameJoinAction: qualifier<GameJoinAction>("GameJoinAction"),
        GameConnectAction: qualifier<GameConnectAction>("GameConnectAction"),
        TurnSubmitAction: qualifier<TurnSubmitAction>("TurnSubmitAction"),
        TurnAddCommandAction: qualifier<TurnAddCommandAction>("TurnAddCommandAction"),
        GameInitAction: qualifier<GameInitAction>("GameInitAction"),
        GameUpdateAction: qualifier<GameUpdateAction>("GameUpdateAction"),
        GameDisposeAction: qualifier<GameDisposeAction>("GameDisposeAction"),
        InputClickAction: qualifier<InputClickAction>("InputClickAction"),
        InputMouseMoveAction: qualifier<InputMouseMoveAction>("InputMouseMoveAction"),
        InputMouseScrollAction: qualifier<InputMouseScrollAction>("InputMouseScrollAction"),
    };

    const diContainer = createDiContainer();
    diContainer.bind(Q.LocalGameStateAccess, ctx => new LocalGameStateAccess());
    diContainer.bind(Q.UserStateAccess, ctx => new UserStateAccess());
    diContainer.bind(Q.GameStateAccess, ctx => new GameStateAccess());
    diContainer.bind(Q.GameConfigStateAccess, ctx => new GameConfigStateAccess());
    diContainer.bind(Q.UIStateAccess, ctx => new UIStateAccess());
    diContainer.bind(Q.GameCanvasHandle, ctx => new GameCanvasHandle());
    diContainer.bind(Q.Renderer, ctx => new Renderer(ctx.get(Q.GameCanvasHandle), ctx.get(Q.LocalGameStateAccess), ctx.get(Q.GameStateAccess), ctx.get(Q.UserStateAccess)));
    diContainer.bind(Q.TilePicker, ctx => new TilePicker(ctx.get(Q.LocalGameStateAccess), ctx.get(Q.GameStateAccess), ctx.get(Q.GameCanvasHandle)));
    diContainer.bind(Q.SetGameStateAction, ctx => new SetGameStateAction(ctx.get(Q.LocalGameStateAccess), ctx.get(Q.GameStateAccess)));
    diContainer.bind(Q.HttpClient, ctx => new HttpClient(API_BASE_URL));
    diContainer.bind(Q.WebsocketClient, ctx => new WebsocketClient(API_WS_BASE_URL));
    diContainer.bind(Q.MessageHandler, ctx => new MessageHandler(ctx.get(Q.SetGameStateAction)));
    diContainer.bind(Q.GameApi, ctx => new GameApiImpl(ctx.get(Q.HttpClient), ctx.get(Q.WebsocketClient), ctx.get(Q.MessageHandler), ctx.get(Q.UserStateAccess)));
    diContainer.bind(Q.UserApi, ctx => new UserApiImpl(ctx.get(Q.HttpClient), ctx.get(Q.UserStateAccess)));
    diContainer.bind(Q.UserSignUpAction, ctx => new UserSignUpAction(ctx.get(Q.UserApi)));
    diContainer.bind(Q.UserLoginAction, ctx => new UserLoginAction(ctx.get(Q.UserApi), ctx.get(Q.GameApi), ctx.get(Q.UserStateAccess), ctx.get(Q.GameConfigStateAccess)));
    diContainer.bind(Q.UserLogOutAction, ctx => new UserLogOutAction(ctx.get(Q.UserStateAccess)));
    diContainer.bind(Q.GameCreateAction, ctx => new GameCreateAction(ctx.get(Q.GameApi)));
    diContainer.bind(Q.GameJoinAction, ctx => new GameJoinAction(ctx.get(Q.GameApi)));
    diContainer.bind(Q.GameConnectAction, ctx => new GameConnectAction(ctx.get(Q.GameApi), ctx.get(Q.LocalGameStateAccess)));
    diContainer.bind(Q.TurnSubmitAction, ctx => new TurnSubmitAction(ctx.get(Q.LocalGameStateAccess), ctx.get(Q.GameApi)));
    diContainer.bind(Q.TurnAddCommandAction, ctx => new TurnAddCommandAction(ctx.get(Q.LocalGameStateAccess), ctx.get(Q.GameConfigStateAccess)));
    diContainer.bind(Q.GameInitAction, ctx => new GameInitAction(ctx.get(Q.GameCanvasHandle), ctx.get(Q.Renderer)));
    diContainer.bind(Q.GameUpdateAction, ctx => new GameUpdateAction(ctx.get(Q.Renderer)));
    diContainer.bind(Q.GameDisposeAction, ctx => new GameDisposeAction(ctx.get(Q.GameCanvasHandle), ctx.get(Q.Renderer)));
    diContainer.bind(Q.InputClickAction, ctx => new InputClickAction(ctx.get(Q.TilePicker), ctx.get(Q.LocalGameStateAccess), ctx.get(Q.UIStateAccess)));
    diContainer.bind(Q.InputMouseMoveAction, ctx => new InputMouseMoveAction(ctx.get(Q.TilePicker), ctx.get(Q.LocalGameStateAccess)));
    diContainer.bind(Q.InputMouseScrollAction, ctx => new InputMouseScrollAction(ctx.get(Q.LocalGameStateAccess)));
    diContainer.createEager();

    export const di = diContainer.getContext();

    let extContext: any = null;

    export function debugLooseWebglContext() {
        const canvasHandle: GameCanvasHandle = AppConfig.di.get(Q.GameCanvasHandle);
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
