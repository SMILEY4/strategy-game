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
import {TurnAddOrderAction} from "./core/actions/turn/turnAddOrderActionImpl";
import {TurnSubmitAction} from "./core/actions/turn/turnSubmitAction";
import {TurnUpdateWorldStateAction} from "./core/actions/turn/turnUpdateWorldStateAction";
import {UserLoginAction} from "./core/actions/user/userLoginAction";
import {UserLogOutAction} from "./core/actions/user/userLogOutAction";
import {UserSignUpAction} from "./core/actions/user/userSignUpAction";
import {GameCanvasHandle} from "./core/service/gameCanvasHandle";
import {Renderer} from "./core/service/rendering/renderer";
import {TilePicker} from "./core/service/tilemap/tilePicker";
import {GameApi} from "./external/api/gameApi";
import {GameMessagingApi} from "./external/api/gameMessagingApi";
import {HttpClient} from "./external/api/httpClient";
import {MessageHandler} from "./external/api/messageHandler";
import {UserApi} from "./external/api/userApi";
import {WebsocketClient} from "./external/api/websocketClient";
import {GameStateAccess} from "./external/state/game/gameStateAccess";
import {AuthProvider} from "./external/state/user/authProvider";
import {UserStateAccess} from "./external/state/user/userStateAccess";
import {WorldStateAccess} from "./external/state/world/worldStateAccess";
import {App} from "./ui/App";
import "./ui/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
// !! Strict-Mode tells react to re-render components twice (calls useEffect 2x) in dev-mode !!
// ==> handle communication with logic outside react-lifecycle with care (or move strict-mode to "page"-level)
// ==> https://reactjs.org/docs/strict-mode.html

const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;

export namespace AppConfig {

    const authProvider: AuthProvider = new AuthProvider();
    const gameStateAccess: GameStateAccess = new GameStateAccess();
    const userStateAccess: UserStateAccess = new UserStateAccess();
    const worldStateAccess: WorldStateAccess = new WorldStateAccess();

    const canvasHandle: GameCanvasHandle = new GameCanvasHandle();
    const renderer: Renderer = new Renderer(canvasHandle, gameStateAccess, worldStateAccess);
    const tilePicker: TilePicker = new TilePicker(gameStateAccess, worldStateAccess, canvasHandle);

    const httpClient = new HttpClient(API_BASE_URL);
    const wsClient = new WebsocketClient(API_WS_BASE_URL);
    const msgHandler = new MessageHandler();

    export const apiGame: GameApi = new GameApi(httpClient, authProvider);
    export const apiUser: UserApi = new UserApi(httpClient, authProvider);
    export const msgApiGame: GameMessagingApi = new GameMessagingApi(wsClient, authProvider, msgHandler);

    export const userSignUp: UserSignUpAction = new UserSignUpAction(apiUser);
    export const userLogin: UserLoginAction = new UserLoginAction(apiUser, userStateAccess);
    export const userLogOut: UserLogOutAction = new UserLogOutAction(userStateAccess);

    export const gameLobbyCreate: GameLobbyCreateAction = new GameLobbyCreateAction(apiGame);
    export const gameLobbyJoin: GameLobbyJoinAction = new GameLobbyJoinAction(apiGame);
    export const gameLobbyConnect: GameLobbyConnectAction = new GameLobbyConnectAction(msgApiGame, gameStateAccess);

    export const turnSubmit: TurnSubmitAction = new TurnSubmitAction(gameStateAccess, msgApiGame);
    export const turnUpdateWorldState: TurnUpdateWorldStateAction = new TurnUpdateWorldStateAction(gameStateAccess, worldStateAccess);
    export const turnAddOrder: TurnAddOrderAction = new TurnAddOrderAction(gameStateAccess);

    export const gameInit: GameInitAction = new GameInitAction(canvasHandle, renderer);
    export const gameUpdate: GameUpdateAction = new GameUpdateAction(renderer);
    export const gameDispose: GameDisposeAction = new GameDisposeAction(canvasHandle, renderer);
    export const gameInputClick: GameInputClickAction = new GameInputClickAction(tilePicker, gameStateAccess);
    export const gameInputMouseMove: GameInputMouseMoveAction = new GameInputMouseMoveAction(tilePicker, gameStateAccess);
    export const gameInputMouseScroll: GameInputMouseScrollAction = new GameInputMouseScrollAction(gameStateAccess);


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
