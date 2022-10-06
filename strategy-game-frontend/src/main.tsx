import React from "react";
import ReactDOM from "react-dom/client";
import {InputClickAction} from "./core/actions/gameInputClickAction";
import {InputMouseMoveAction} from "./core/actions/gameInputMouseMoveAction";
import {InputMouseScrollAction} from "./core/actions/gameInputMouseScrollAction";
import {GameConnectAction} from "./core/actions/gameLobbyConnectAction";
import {GameCreateAction} from "./core/actions/gameLobbyCreateAction";
import {GameJoinAction} from "./core/actions/gameLobbyJoinAction";
import {GameDisposeAction} from "./core/gameDisposeAction";
import {GameInitAction} from "./core/gameInitAction";
import {GameUpdateAction} from "./core/gameUpdateAction";
import {GameCanvasHandle} from "./core/rendering/gameCanvasHandle";
import {Renderer} from "./core/rendering/renderer";
import {SetGameStateAction} from "./core/setGameStateAction";
import {TilePicker} from "./core/tilemap/tilePicker";
import {TurnAddCommandAction} from "./core/turnAddCommandAction";
import {TurnSubmitAction} from "./core/turnSubmitAction";
import {UserLoginAction} from "./core/userLoginAction";
import {UserLogOutAction} from "./core/userLogOutAction";
import {UserSignUpAction} from "./core/userSignUpAction";
import {HttpGameApi} from "./external/api/http/gameApi";
import {HttpClient} from "./external/api/http/httpClient";
import {HttpUserApi} from "./external/api/http/userApi";
import {GameMessagingApi} from "./external/api/messaging/gameMessagingApi";
import {MessageHandler} from "./external/api/messaging/messageHandler";
import {WebsocketClient} from "./external/api/messaging/websocketClient";
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

    export const diContainer = createDiContainer();
    diContainer.bind("LocalGameStateAccess", ctx => new LocalGameStateAccess());
    diContainer.bind("UserStateAccess", ctx => new UserStateAccess());
    diContainer.bind("GameStateAccess", ctx => new GameStateAccess());
    diContainer.bind("GameConfigStateAccess", ctx => new GameConfigStateAccess());
    diContainer.bind("UIStateAccess", ctx => new UIStateAccess());
    diContainer.bind("GameCanvasHandle", ctx => new GameCanvasHandle());
    diContainer.bind("Renderer", ctx => new Renderer(ctx.get("GameCanvasHandle"), ctx.get("LocalGameStateAccess"), ctx.get("GameStateAccess"), ctx.get("UserStateAccess")));
    diContainer.bind("TilePicker", ctx => new TilePicker(ctx.get("LocalGameStateAccess"), ctx.get("GameStateAccess"), ctx.get("GameCanvasHandle")));
    diContainer.bind("SetGameStateAction", ctx => new SetGameStateAction(ctx.get("LocalGameStateAccess"), ctx.get("GameStateAccess")));
    diContainer.bind("HttpClient", ctx => new HttpClient(API_BASE_URL));
    diContainer.bind("WebsocketClient", ctx => new WebsocketClient(API_WS_BASE_URL));
    diContainer.bind("MessageHandler", ctx => new MessageHandler(ctx.get("SetGameStateAction")));
    diContainer.bind("HttpGameApi", ctx => new HttpGameApi(ctx.get("HttpClient"), ctx.get("UserStateAccess")));
    diContainer.bind("HttpUserApi", ctx => new HttpUserApi(ctx.get("HttpClient"), ctx.get("UserStateAccess")));
    diContainer.bind("GameMessagingApi", ctx => new GameMessagingApi(ctx.get("WebsocketClient"), ctx.get("UserStateAccess"), ctx.get("MessageHandler")));
    diContainer.bind("UserSignUpAction", ctx => new UserSignUpAction(ctx.get("HttpUserApi")));
    diContainer.bind("UserLoginAction", ctx => new UserLoginAction(ctx.get("HttpUserApi"), ctx.get("HttpGameApi"), ctx.get("UserStateAccess"), ctx.get("GameConfigStateAccess")));
    diContainer.bind("UserLogOutAction", ctx => new UserLogOutAction(ctx.get("UserStateAccess")));
    diContainer.bind("GameCreateAction", ctx => new GameCreateAction(ctx.get("HttpGameApi")));
    diContainer.bind("GameJoinAction", ctx => new GameJoinAction(ctx.get("HttpGameApi")));
    diContainer.bind("GameConnectAction", ctx => new GameConnectAction(ctx.get("GameMessagingApi"), ctx.get("LocalGameStateAccess")));
    diContainer.bind("TurnSubmitAction", ctx => new TurnSubmitAction(ctx.get("LocalGameStateAccess"), ctx.get("GameMessagingApi")));
    diContainer.bind("TurnAddCommandAction", ctx => new TurnAddCommandAction(ctx.get("LocalGameStateAccess"), ctx.get("GameConfigStateAccess")));
    diContainer.bind("GameInitAction", ctx => new GameInitAction(ctx.get("GameCanvasHandle"), ctx.get("Renderer")));
    diContainer.bind("GameUpdateAction", ctx => new GameUpdateAction(ctx.get("Renderer")));
    diContainer.bind("GameDisposeAction", ctx => new GameDisposeAction(ctx.get("GameCanvasHandle"), ctx.get("Renderer")));
    diContainer.bind("InputClickAction", ctx => new InputClickAction(ctx.get("TilePicker"), ctx.get("LocalGameStateAccess"), ctx.get("UIStateAccess")));
    diContainer.bind("InputMouseMoveAction", ctx => new InputMouseMoveAction(ctx.get("TilePicker"), ctx.get("LocalGameStateAccess")));
    diContainer.bind("InputMouseScrollAction", ctx => new InputMouseScrollAction(ctx.get("LocalGameStateAccess")));
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
