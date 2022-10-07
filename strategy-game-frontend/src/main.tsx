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
import {createDiContainer} from "./shared/di";
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

    const QUALIFIERS = {
        LocalGameStateAccess: "LocalGameStateAccess",
        UserStateAccess: "UserStateAccess",
        GameStateAccess: "GameStateAccess",
        GameConfigStateAccess: "GameConfigStateAccess",
        UIStateAccess: "UIStateAccess",
        GameCanvasHandle: "GameCanvasHandle",
        Renderer: "Renderer",
        TilePicker: "TilePicker",
        SetGameStateAction: "SetGameStateAction",
        HttpClient: "HttpClient",
        WebsocketClient: "WebsocketClient",
        MessageHandler: "MessageHandler",
        GameApi: "GameApi",
        UserApi: "UserApi",
        UserSignUpAction: "UserSignUpAction",
        UserLoginAction: "UserLoginAction",
        UserLogOutAction: "UserLogOutAction",
        GameCreateAction: "GameCreateAction",
        GameJoinAction: "GameJoinAction",
        GameConnectAction: "GameConnectAction",
        TurnSubmitAction: "TurnSubmitAction",
        TurnAddCommandAction: "TurnAddCommandAction",
        GameInitAction: "GameInitAction",
        GameUpdateAction: "GameUpdateAction",
        GameDisposeAction: "GameDisposeAction",
        InputClickAction: "InputClickAction",
        InputMouseMoveAction: "InputMouseMoveAction",
        InputMouseScrollAction: "InputMouseScrollAction",
    };

    const diContainer = createDiContainer();
    diContainer.bind(QUALIFIERS.LocalGameStateAccess, ctx => new LocalGameStateAccess());
    diContainer.bind(QUALIFIERS.UserStateAccess, ctx => new UserStateAccess());
    diContainer.bind(QUALIFIERS.GameStateAccess, ctx => new GameStateAccess());
    diContainer.bind(QUALIFIERS.GameConfigStateAccess, ctx => new GameConfigStateAccess());
    diContainer.bind(QUALIFIERS.UIStateAccess, ctx => new UIStateAccess());
    diContainer.bind(QUALIFIERS.GameCanvasHandle, ctx => new GameCanvasHandle());
    diContainer.bind(QUALIFIERS.Renderer, ctx => new Renderer(ctx.get(QUALIFIERS.GameCanvasHandle), ctx.get(QUALIFIERS.LocalGameStateAccess), ctx.get(QUALIFIERS.GameStateAccess), ctx.get(QUALIFIERS.UserStateAccess)));
    diContainer.bind(QUALIFIERS.TilePicker, ctx => new TilePicker(ctx.get(QUALIFIERS.LocalGameStateAccess), ctx.get(QUALIFIERS.GameStateAccess), ctx.get(QUALIFIERS.GameCanvasHandle)));
    diContainer.bind(QUALIFIERS.SetGameStateAction, ctx => new SetGameStateAction(ctx.get(QUALIFIERS.LocalGameStateAccess), ctx.get(QUALIFIERS.GameStateAccess)));
    diContainer.bind(QUALIFIERS.HttpClient, ctx => new HttpClient(API_BASE_URL));
    diContainer.bind(QUALIFIERS.WebsocketClient, ctx => new WebsocketClient(API_WS_BASE_URL));
    diContainer.bind(QUALIFIERS.MessageHandler, ctx => new MessageHandler(ctx.get(QUALIFIERS.SetGameStateAction)));
    diContainer.bind(QUALIFIERS.GameApi, ctx => new GameApiImpl(ctx.get(QUALIFIERS.HttpClient), ctx.get(QUALIFIERS.WebsocketClient), ctx.get(QUALIFIERS.MessageHandler), ctx.get(QUALIFIERS.UserStateAccess)));
    diContainer.bind(QUALIFIERS.UserApi, ctx => new UserApiImpl(ctx.get(QUALIFIERS.HttpClient), ctx.get(QUALIFIERS.UserStateAccess)));
    diContainer.bind(QUALIFIERS.UserSignUpAction, ctx => new UserSignUpAction(ctx.get(QUALIFIERS.UserApi)));
    diContainer.bind(QUALIFIERS.UserLoginAction, ctx => new UserLoginAction(ctx.get(QUALIFIERS.UserApi), ctx.get(QUALIFIERS.GameApi), ctx.get(QUALIFIERS.UserStateAccess), ctx.get(QUALIFIERS.GameConfigStateAccess)));
    diContainer.bind(QUALIFIERS.UserLogOutAction, ctx => new UserLogOutAction(ctx.get(QUALIFIERS.UserStateAccess)));
    diContainer.bind(QUALIFIERS.GameCreateAction, ctx => new GameCreateAction(ctx.get(QUALIFIERS.GameApi)));
    diContainer.bind(QUALIFIERS.GameJoinAction, ctx => new GameJoinAction(ctx.get(QUALIFIERS.GameApi)));
    diContainer.bind(QUALIFIERS.GameConnectAction, ctx => new GameConnectAction(ctx.get(QUALIFIERS.GameApi), ctx.get(QUALIFIERS.LocalGameStateAccess)));
    diContainer.bind(QUALIFIERS.TurnSubmitAction, ctx => new TurnSubmitAction(ctx.get(QUALIFIERS.LocalGameStateAccess), ctx.get(QUALIFIERS.GameApi)));
    diContainer.bind(QUALIFIERS.TurnAddCommandAction, ctx => new TurnAddCommandAction(ctx.get(QUALIFIERS.LocalGameStateAccess), ctx.get(QUALIFIERS.GameConfigStateAccess)));
    diContainer.bind(QUALIFIERS.GameInitAction, ctx => new GameInitAction(ctx.get(QUALIFIERS.GameCanvasHandle), ctx.get(QUALIFIERS.Renderer)));
    diContainer.bind(QUALIFIERS.GameUpdateAction, ctx => new GameUpdateAction(ctx.get(QUALIFIERS.Renderer)));
    diContainer.bind(QUALIFIERS.GameDisposeAction, ctx => new GameDisposeAction(ctx.get(QUALIFIERS.GameCanvasHandle), ctx.get(QUALIFIERS.Renderer)));
    diContainer.bind(QUALIFIERS.InputClickAction, ctx => new InputClickAction(ctx.get(QUALIFIERS.TilePicker), ctx.get(QUALIFIERS.LocalGameStateAccess), ctx.get(QUALIFIERS.UIStateAccess)));
    diContainer.bind(QUALIFIERS.InputMouseMoveAction, ctx => new InputMouseMoveAction(ctx.get(QUALIFIERS.TilePicker), ctx.get(QUALIFIERS.LocalGameStateAccess)));
    diContainer.bind(QUALIFIERS.InputMouseScrollAction, ctx => new InputMouseScrollAction(ctx.get(QUALIFIERS.LocalGameStateAccess)));
    diContainer.createEager();

    export const di = diContainer.getContext();

    let extContext: any = null;

    export function debugLooseWebglContext() {
        const canvasHandle: GameCanvasHandle = AppConfig.di.get("GameCanvasHandle");
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
