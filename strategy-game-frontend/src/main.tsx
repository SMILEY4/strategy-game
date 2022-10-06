import React from "react";
import ReactDOM from "react-dom/client";
import {GameDisposeAction} from "./core/gameDisposeAction";
import {GameInitAction} from "./core/gameInitAction";
import {InputClickAction} from "./core/actions/gameInputClickAction";
import {InputMouseMoveAction} from "./core/actions/gameInputMouseMoveAction";
import {InputMouseScrollAction} from "./core/actions/gameInputMouseScrollAction";
import {GameUpdateAction} from "./core/gameUpdateAction";
import {GameConnectAction} from "./core/actions/gameLobbyConnectAction";
import {GameCreateAction} from "./core/actions/gameLobbyCreateAction";
import {GameJoinAction} from "./core/actions/gameLobbyJoinAction";
import {SetGameStateAction} from "./core/setGameStateAction";
import {TurnAddCommandAction} from "./core/turnAddCommandAction";
import {TurnSubmitAction} from "./core/turnSubmitAction";
import {UserLoginAction} from "./core/userLoginAction";
import {UserLogOutAction} from "./core/userLogOutAction";
import {UserSignUpAction} from "./core/userSignUpAction";
import {GameCanvasHandle} from "./core/rendering/gameCanvasHandle";
import {Renderer} from "./core/rendering/renderer";
import {TilePicker} from "./core/tilemap/tilePicker";
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


    export const apiGame: HttpGameApi = new HttpGameApi(httpClient, userStateAccess);
    export const apiUser: HttpUserApi = new HttpUserApi(httpClient, userStateAccess);
    export const msgApiGame: GameMessagingApi = new GameMessagingApi(wsClient, userStateAccess, msgHandler);

    export const userSignUp: UserSignUpAction = new UserSignUpAction(apiUser);
    export const userLogin: UserLoginAction = new UserLoginAction(apiUser, apiGame, userStateAccess, gameConfigStateAccess);
    export const userLogOut: UserLogOutAction = new UserLogOutAction(userStateAccess);

    export const gameLobbyCreate: GameCreateAction = new GameCreateAction(apiGame);
    export const gameLobbyJoin: GameJoinAction = new GameJoinAction(apiGame);
    export const gameLobbyConnect: GameConnectAction = new GameConnectAction(msgApiGame, localGameStateAccess);

    export const turnSubmit: TurnSubmitAction = new TurnSubmitAction(localGameStateAccess, msgApiGame);
    export const turnAddCommand: TurnAddCommandAction = new TurnAddCommandAction(localGameStateAccess, gameConfigStateAccess);

    export const gameInit: GameInitAction = new GameInitAction(canvasHandle, renderer);
    export const gameUpdate: GameUpdateAction = new GameUpdateAction(renderer);
    export const gameDispose: GameDisposeAction = new GameDisposeAction(canvasHandle, renderer);
    export const gameInputClick: InputClickAction = new InputClickAction(tilePicker, localGameStateAccess, uiStateAccess);
    export const gameInputMouseMove: InputMouseMoveAction = new InputMouseMoveAction(tilePicker, localGameStateAccess);
    export const gameInputMouseScroll: InputMouseScrollAction = new InputMouseScrollAction(localGameStateAccess);

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
