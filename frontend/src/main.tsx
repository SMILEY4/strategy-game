import React from "react";
import ReactDOM from "react-dom/client";
import {GameConnectAction} from "./core/gameConnectAction";
import {GameCreateAction} from "./core/gameCreateAction";
import {GameDisposeAction} from "./core/gameDisposeAction";
import {GameInitAction} from "./core/gameInitAction";
import {GameJoinAction} from "./core/gameJoinAction";
import {GameListAction} from "./core/gameListAction";
import {GameSetStateAction} from "./core/gameSetStateAction";
import {GameUpdateAction} from "./core/gameUpdateAction";
import {InputClickAction} from "./core/inputClickAction";
import {InputMouseMoveAction} from "./core/inputMouseMoveAction";
import {InputMouseScrollAction} from "./core/inputMouseScrollAction";
import SHADER_SRC_COMMON from "./core/rendering/common/common.glsl?raw";
import {GameCanvasHandle} from "./core/rendering/gameCanvasHandle";
import {LineRenderer} from "./core/rendering/lines/lineRenderer";
import {Renderer} from "./core/rendering/renderer";
import SHADER_SRC_TILEMAP_FRAG from "./core/rendering/tilemap/mapShader.fsh?raw";
import SHADER_SRC_TILEMAP_VERT from "./core/rendering/tilemap/mapShader.vsh?raw";
import {TilemapRenderer} from "./core/rendering/tilemap/tilemapRenderer";
import {TileObjectRenderer} from "./core/rendering/tileobject/tileObjectRenderer";
import SHADER_SRC_TILE_OBJECT_FRAG from "./core/rendering/tileobject/tileObjectShader.fsh?raw";
import SHADER_SRC_TILE_OBJECT_VERT from "./core/rendering/tileobject/tileObjectShader.vsh?raw";
import {ShaderSourceManager} from "./core/rendering/utils/shaderSourceManager";
import {GameApi} from "./core/required/gameApi";
import {GameConfigRepository} from "./core/required/gameConfigRepository";
import {GameRepository} from "./core/required/gameRepository";
import {UIService} from "./core/required/UIService";
import {UserApi} from "./core/required/userApi";
import {UserRepository} from "./core/required/userRepository";
import {WorldRepository} from "./core/required/worldRepository";
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
import {GameRepositoryImpl} from "./external/state/game/gameRepositoryImpl";
import {GameConfigRepositoryImpl} from "./external/state/gameconfig/gameConfigRepositoryImpl";
import {UIServiceImpl} from "./external/state/ui/uiServiceImpl";
import {UserRepositoryImpl} from "./external/state/user/userRepositoryImpl";
import {WorldRepositoryImpl} from "./external/state/world/worldRepositoryImpl";
import {createDiContainer, qualifier} from "./shared/di";
import SHADER_SRC_LINE_VERT from "./core/rendering/lines/lineShader.vsh?raw";
import SHADER_SRC_LINE_FRAG from "./core/rendering/lines/lineShader.fsh?raw";

import {GamePreviewCityCreation} from "./core/gamePreviewCityCreation";
import {App} from "./ui/pages/App";
import {GameDeleteAction} from "./core/gameDeleteAction";

const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;

export namespace AppConfig {

    export const DIQ = {
        GameApi: qualifier<GameApi>("GameApi"),
        GameCanvasHandle: qualifier<GameCanvasHandle>("GameCanvasHandle"),
        GameConfigRepository: qualifier<GameConfigRepository>("GameConfigRepository"),
        GameConnectAction: qualifier<GameConnectAction>("GameConnectAction"),
        GameCreateAction: qualifier<GameCreateAction>("GameCreateAction"),
        GameDeleteAction: qualifier<GameDeleteAction>("GameDeleteAction"),
        GameDisposeAction: qualifier<GameDisposeAction>("GameDisposeAction"),
        GameInitAction: qualifier<GameInitAction>("GameInitAction"),
        GameJoinAction: qualifier<GameJoinAction>("GameJoinAction"),
        GameListAction: qualifier<GameListAction>("GameListAction"),
        GamePreviewCityCreation: qualifier<GamePreviewCityCreation>("GamePreviewCityCreation"),
        GameRepository: qualifier<GameRepository>("GameRepository"),
        GameSetStateAction: qualifier<GameSetStateAction>("GameSetStateAction"),
        GameUpdateAction: qualifier<GameUpdateAction>("GameUpdateAction"),
        HttpClient: qualifier<HttpClient>("HttpClient"),
        InputClickAction: qualifier<InputClickAction>("InputClickAction"),
        InputMouseMoveAction: qualifier<InputMouseMoveAction>("InputMouseMoveAction"),
        InputMouseScrollAction: qualifier<InputMouseScrollAction>("InputMouseScrollAction"),
        MessageHandler: qualifier<MessageHandler>("MessageHandler"),
        Renderer: qualifier<Renderer>("Renderer"),
        ShaderSourceManager: qualifier<ShaderSourceManager>("ShaderSourceManager"),
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
    diContainer.bind(DIQ.GameConfigRepository, ctx => new GameConfigRepositoryImpl());
    diContainer.bind(DIQ.GameConnectAction, ctx => new GameConnectAction(ctx.get(DIQ.GameApi), ctx.get(DIQ.GameRepository)));
    diContainer.bind(DIQ.GameCreateAction, ctx => new GameCreateAction(ctx.get(DIQ.GameApi)));
    diContainer.bind(DIQ.GameDeleteAction, ctx => new GameDeleteAction(ctx.get(DIQ.GameApi)));
    diContainer.bind(DIQ.GameDisposeAction, ctx => new GameDisposeAction(ctx.get(DIQ.GameCanvasHandle), ctx.get(DIQ.Renderer)));
    diContainer.bind(DIQ.GameInitAction, ctx => new GameInitAction(ctx.get(DIQ.GameCanvasHandle), ctx.get(DIQ.Renderer)));
    diContainer.bind(DIQ.GameJoinAction, ctx => new GameJoinAction(ctx.get(DIQ.GameApi)));
    diContainer.bind(DIQ.GameListAction, ctx => new GameListAction(ctx.get(DIQ.GameApi)));
    diContainer.bind(DIQ.GamePreviewCityCreation, ctx => new GamePreviewCityCreation(ctx.get(DIQ.GameApi) ,ctx.get(DIQ.GameRepository)));
    diContainer.bind(DIQ.GameRepository, ctx => new GameRepositoryImpl());
    diContainer.bind(DIQ.GameSetStateAction, ctx => new GameSetStateAction(ctx.get(DIQ.GameRepository), ctx.get(DIQ.WorldRepository)));
    diContainer.bind(DIQ.GameUpdateAction, ctx => new GameUpdateAction(ctx.get(DIQ.Renderer)));
    diContainer.bind(DIQ.HttpClient, ctx => new HttpClient(API_BASE_URL));
    diContainer.bind(DIQ.InputClickAction, ctx => new InputClickAction(ctx.get(DIQ.TilePicker), ctx.get(DIQ.GameRepository), ctx.get(DIQ.UIService)));
    diContainer.bind(DIQ.InputMouseMoveAction, ctx => new InputMouseMoveAction(ctx.get(DIQ.TilePicker), ctx.get(DIQ.GameRepository)));
    diContainer.bind(DIQ.InputMouseScrollAction, ctx => new InputMouseScrollAction(ctx.get(DIQ.GameRepository)));
    diContainer.bind(DIQ.MessageHandler, ctx => new MessageHandler(ctx.get(DIQ.GameSetStateAction)));
    diContainer.bind(DIQ.Renderer, ctx => new Renderer(ctx.get(DIQ.GameCanvasHandle), ctx.get(DIQ.ShaderSourceManager), ctx.get(DIQ.GameRepository), ctx.get(DIQ.WorldRepository), ctx.get(DIQ.UserRepository)));
    diContainer.bind(DIQ.ShaderSourceManager, ctx => new ShaderSourceManager()
        .add("common", SHADER_SRC_COMMON)
        .add(TilemapRenderer.SHADER_SRC_KEY_VERTEX, SHADER_SRC_TILEMAP_VERT)
        .add(TilemapRenderer.SHADER_SRC_KEY_FRAGMENT, SHADER_SRC_TILEMAP_FRAG)
        .add(TileObjectRenderer.SHADER_SRC_KEY_VERTEX, SHADER_SRC_TILE_OBJECT_VERT)
        .add(TileObjectRenderer.SHADER_SRC_KEY_FRAGMENT, SHADER_SRC_TILE_OBJECT_FRAG)
        .add(LineRenderer.SHADER_SRC_KEY_VERTEX, SHADER_SRC_LINE_VERT)
        .add(LineRenderer.SHADER_SRC_KEY_FRAGMENT, SHADER_SRC_LINE_FRAG),
    );
    diContainer.bind(DIQ.TilePicker, ctx => new TilePicker(ctx.get(DIQ.GameRepository), ctx.get(DIQ.WorldRepository), ctx.get(DIQ.GameCanvasHandle)));
    diContainer.bind(DIQ.TurnAddCommandAction, ctx => new TurnAddCommandAction(ctx.get(DIQ.GameRepository), ctx.get(DIQ.GameConfigRepository)));
    diContainer.bind(DIQ.TurnSubmitAction, ctx => new TurnSubmitAction(ctx.get(DIQ.GameRepository), ctx.get(DIQ.GameApi)));
    diContainer.bind(DIQ.UIService, ctx => new UIServiceImpl());
    diContainer.bind(DIQ.UserApi, ctx => new UserApiImpl(ctx.get(DIQ.HttpClient), ctx.get(DIQ.UserRepository)));
    diContainer.bind(DIQ.UserLoginAction, ctx => new UserLoginAction(ctx.get(DIQ.UserApi), ctx.get(DIQ.UserRepository)));
    diContainer.bind(DIQ.UserLogOutAction, ctx => new UserLogOutAction(ctx.get(DIQ.UserRepository)));
    diContainer.bind(DIQ.UserRepository, ctx => new UserRepositoryImpl());
    diContainer.bind(DIQ.UserSignUpAction, ctx => new UserSignUpAction(ctx.get(DIQ.UserApi)));
    diContainer.bind(DIQ.WebsocketClient, ctx => new WebsocketClient(ctx.get(DIQ.HttpClient), API_WS_BASE_URL));
    diContainer.bind(DIQ.WorldRepository, ctx => new WorldRepositoryImpl());
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

    ReactDOM.createRoot(document.getElementById("root")!).render(<App/>);
// !! Strict-Mode tells react to re-render components twice (calls useEffect 2x) in dev-mode !!
// ==> Problems with canvas/rendering
// ==> https://reactjs.org/docs/strict-mode.html

}
