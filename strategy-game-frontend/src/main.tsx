import React from "react";
import ReactDOM from "react-dom/client";
import {GameDisposeAction} from "./core/actions/game/gameDisposeAction";
import {GameInitAction} from "./core/actions/game/gameInitAction";
import {GameInputClickAction} from "./core/actions/game/gameInputClickAction";
import {GameInputMouseMoveAction} from "./core/actions/game/gameInputMouseMoveAction";
import {GameInputMouseScrollAction} from "./core/actions/game/gameInputMouseScrollAction";
import {GameUpdateAction} from "./core/actions/game/gameUpdateAction";
import {GameLobbyConnectAction} from "./core/actions/gamelobby/gameLobbyConnectAction";
import {GameLobbyCreateAction} from "./core/actions/gamelobby/gameLobbyCreateAction";
import {GameLobbyJoinAction} from "./core/actions/gamelobby/gameLobbyJoinAction";
import {SetGameStateAction} from "./core/actions/gamelobby/setGameStateAction";
import {TurnAddCommandAction} from "./core/actions/turn/turnAddCommandAction";
import {TurnSubmitAction} from "./core/actions/turn/turnSubmitAction";
import {UserLoginAction} from "./core/actions/user/userLoginAction";
import {UserLogOutAction} from "./core/actions/user/userLogOutAction";
import {UserSignUpAction} from "./core/actions/user/userSignUpAction";
import {GameCanvasHandle} from "./core/service/gameCanvasHandle";
import {Renderer} from "./core/service/rendering/renderer";
import {TilePicker} from "./core/service/tilemap/tilePicker";
import {GameApi} from "./external/api/http/gameApi";
import {HttpClient} from "./external/api/http/httpClient";
import {UserApi} from "./external/api/http/userApi";
import {GameMessagingApi} from "./external/api/messaging/gameMessagingApi";
import {MessageHandler} from "./external/api/messaging/messageHandler";
import {WebsocketClient} from "./external/api/messaging/websocketClient";
import {GameStateAccess} from "./external/state/game/gameStateAccess";
import {GameConfigStateAccess} from "./external/state/gameconfig/gameConfigStateAccess";
import {LocalGameStateAccess} from "./external/state/localgame/localGameStateAccess";
import {UIStateAccess} from "./external/state/ui/uiStateAccess";
import {UserStateAccess} from "./external/state/user/userStateAccess";
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

    const localGameStateAccess: LocalGameStateAccess = new LocalGameStateAccess();
    const userStateAccess: UserStateAccess = new UserStateAccess();
    const gameStateAccess: GameStateAccess = new GameStateAccess();
    const gameConfigStateAccess: GameConfigStateAccess = new GameConfigStateAccess();
    const uiStateAccess: UIStateAccess = new UIStateAccess();

    const canvasHandle: GameCanvasHandle = new GameCanvasHandle();
    const renderer: Renderer = new Renderer(canvasHandle, localGameStateAccess, gameStateAccess, userStateAccess);
    const tilePicker: TilePicker = new TilePicker(localGameStateAccess, gameStateAccess, canvasHandle);

    export const gameSetState: SetGameStateAction = new SetGameStateAction(localGameStateAccess, gameStateAccess);

    const httpClient = new HttpClient(API_BASE_URL);
    const wsClient = new WebsocketClient(API_WS_BASE_URL);
    const msgHandler = new MessageHandler(gameSetState);


    export const apiGame: GameApi = new GameApi(httpClient, userStateAccess);
    export const apiUser: UserApi = new UserApi(httpClient, userStateAccess);
    export const msgApiGame: GameMessagingApi = new GameMessagingApi(wsClient, userStateAccess, msgHandler);

    export const userSignUp: UserSignUpAction = new UserSignUpAction(apiUser);
    export const userLogin: UserLoginAction = new UserLoginAction(apiUser, apiGame, userStateAccess, gameConfigStateAccess);
    export const userLogOut: UserLogOutAction = new UserLogOutAction(userStateAccess);

    export const gameLobbyCreate: GameLobbyCreateAction = new GameLobbyCreateAction(apiGame);
    export const gameLobbyJoin: GameLobbyJoinAction = new GameLobbyJoinAction(apiGame);
    export const gameLobbyConnect: GameLobbyConnectAction = new GameLobbyConnectAction(msgApiGame, localGameStateAccess);

    export const turnSubmit: TurnSubmitAction = new TurnSubmitAction(localGameStateAccess, msgApiGame);
    export const turnAddCommand: TurnAddCommandAction = new TurnAddCommandAction(localGameStateAccess, gameConfigStateAccess);

    export const gameInit: GameInitAction = new GameInitAction(canvasHandle, renderer);
    export const gameUpdate: GameUpdateAction = new GameUpdateAction(renderer);
    export const gameDispose: GameDisposeAction = new GameDisposeAction(canvasHandle, renderer);
    export const gameInputClick: GameInputClickAction = new GameInputClickAction(tilePicker, localGameStateAccess, uiStateAccess);
    export const gameInputMouseMove: GameInputMouseMoveAction = new GameInputMouseMoveAction(tilePicker, localGameStateAccess);
    export const gameInputMouseScroll: GameInputMouseScrollAction = new GameInputMouseScrollAction(localGameStateAccess);

    let extContext: any = null;

    export function debugLooseWebglContext() {
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
