import React from "react";
import ReactDOM from "react-dom/client";
import {GameDisposeActionImpl} from "./core/actions/game/gameDisposeActionImpl";
import {GameInitActionImpl} from "./core/actions/game/gameInitActionImpl";
import {GameInputClickActionImpl} from "./core/actions/game/gameInputClickActionImpl";
import {GameInputMouseMoveActionImpl} from "./core/actions/game/gameInputMouseMoveActionImpl";
import {GameInputMouseScrollActionImpl} from "./core/actions/game/gameInputMouseScrollActionImpl";
import {GameCanvasHandle} from "./core/service/GameCanvasHandle";
import {GameUpdateActionImpl} from "./core/actions/game/GameUpdateActionImpl";
import {GameLobbyConnectActionImpl} from "./core/actions/gamelobby/GameLobbyConnectActionImpl";
import {GameLobbyCreateActionImpl} from "./core/actions/gamelobby/GameLobbyCreateActionImpl";
import {GameLobbyJoinActionImpl} from "./core/actions/gamelobby/GameLobbyJoinActionImpl";
import {TurnSubmitActionImpl} from "./core/actions/turn/TurnSubmitActionImpl";
import {TurnUpdateWorldStateActionImpl} from "./core/actions/turn/TurnUpdateWorldStateActionImpl";
import {UserLoginActionImpl} from "./core/actions/user/UserLoginActionImpl";
import {UserLogOutActionImpl} from "./core/actions/user/UserLogOutActionImpl";
import {UserSignUpActionImpl} from "./core/actions/user/UserSignUpActionImpl";
import {Renderer} from "./core/service/rendering/renderer";
import {TilePicker} from "./core/service/tilemap/tilePicker";
import {GameApiClient} from "./external/api/gameApiClient";
import {GameWebsocketApi} from "./external/api/gameWebsocketApi";
import {HttpClient} from "./external/api/httpClient";
import {MessageHandler} from "./external/api/messageHandler";
import {UserApiClient} from "./external/api/userApiClient";
import {WebsocketClient} from "./external/api/websocketClient";
import {GameStateAccessImpl} from "./external/state/game/gameStateAccessImpl";
import {AuthProviderImpl} from "./external/state/user/AuthProviderImpl";
import {UserStateAccessImpl} from "./external/state/user/UserStateAccessImpl";
import {WorldStateAccessImpl} from "./external/state/world/WorldStateAccessImpl";
import {GameDisposeAction} from "./ports/provided/game/GameDisposeAction";
import {GameInitAction} from "./ports/provided/game/GameInitAction";
import {GameInputClickAction} from "./ports/provided/game/GameInputClickAction";
import {GameInputMouseMoveAction} from "./ports/provided/game/GameInputMouseMoveAction";
import {GameInputMouseScrollAction} from "./ports/provided/game/GameInputMouseScrollAction";
import {GameUpdateAction} from "./ports/provided/game/GameUpdateAction";
import {GameLobbyConnectAction} from "./ports/provided/gamelobby/gameLobbyConnectAction";
import {GameLobbyCreateAction} from "./ports/provided/gamelobby/gameLobbyCreateAction";
import {GameLobbyJoinAction} from "./ports/provided/gamelobby/gameLobbyJoinAction";
import {TurnSubmitAction} from "./ports/provided/turn/TurnSubmitAction";
import {TurnUpdateWorldStateAction} from "./ports/provided/turn/TurnUpdateWorldStateAction";
import {UserLogOutAction} from "./ports/provided/user/UserLogOutAction";
import {UserSignUpAction} from "./ports/provided/user/UserSignUpAction";
import {GameApi} from "./ports/required/api/gameApi";
import {GameMessagingApi} from "./ports/required/api/gameMessagingApi";
import {UserApi} from "./ports/required/api/userApi";
import {AuthProvider} from "./ports/required/state/authProvider";
import {GameStateAccess} from "./ports/required/state/gameStateAccess";
import {UserStateAccess} from "./ports/required/state/userStateAccess";
import {WorldStateAccess} from "./ports/required/state/worldStateAccess";
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

    const authProvider: AuthProvider = new AuthProviderImpl();
    const gameStateAccess: GameStateAccess = new GameStateAccessImpl();
    const userStateAccess: UserStateAccess = new UserStateAccessImpl();
    const worldStateAccess: WorldStateAccess = new WorldStateAccessImpl();

    const canvasHandle: GameCanvasHandle = new GameCanvasHandle();
    const renderer: Renderer = new Renderer(canvasHandle, gameStateAccess, worldStateAccess);
    const tilePicker: TilePicker = new TilePicker(gameStateAccess, worldStateAccess, canvasHandle);

    const httpClient = new HttpClient(API_BASE_URL);
    const wsClient = new WebsocketClient(API_WS_BASE_URL);
    const msgHandler = new MessageHandler();

    export const apiGame: GameApi = new GameApiClient(httpClient, authProvider);
    export const apiUser: UserApi = new UserApiClient(httpClient, authProvider);
    export const msgApiGame: GameMessagingApi = new GameWebsocketApi(wsClient, authProvider, msgHandler);

    export const userSignUp: UserSignUpAction = new UserSignUpActionImpl(apiUser);
    export const userLogin: UserLoginActionImpl = new UserLoginActionImpl(apiUser, userStateAccess);
    export const userLogOut: UserLogOutAction = new UserLogOutActionImpl(userStateAccess);

    export const gameLobbyCreate: GameLobbyCreateAction = new GameLobbyCreateActionImpl(apiGame);
    export const gameLobbyJoin: GameLobbyJoinAction = new GameLobbyJoinActionImpl(apiGame);
    export const gameLobbyConnect: GameLobbyConnectAction = new GameLobbyConnectActionImpl(msgApiGame, gameStateAccess);

    export const turnSubmit: TurnSubmitAction = new TurnSubmitActionImpl(gameStateAccess, msgApiGame);
    export const turnUpdateWorldState: TurnUpdateWorldStateAction = new TurnUpdateWorldStateActionImpl(gameStateAccess, worldStateAccess);

    export const gameInit: GameInitAction = new GameInitActionImpl(canvasHandle, renderer);
    export const gameUpdate: GameUpdateAction = new GameUpdateActionImpl(renderer);
    export const gameDispose: GameDisposeAction = new GameDisposeActionImpl(canvasHandle, renderer);
    export const gameInputClick: GameInputClickAction = new GameInputClickActionImpl(tilePicker, gameStateAccess);
    export const gameInputMouseMove: GameInputMouseMoveAction = new GameInputMouseMoveActionImpl(tilePicker, gameStateAccess);
    export const gameInputMouseScroll: GameInputMouseScrollAction = new GameInputMouseScrollActionImpl(gameStateAccess);


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
