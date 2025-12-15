import React from "react";
import ReactDOM from "react-dom/client";
import {App} from "./ui/pages/App";
import {ArrayExtensions} from "./common/extensions";
import {toBoolean} from "./common/utils";
import {GLError} from "./common/webgl/glError";
import {WebGLMonitor} from "./common/webgl/monitor/webGLMonitor";
import {HttpClient as NewHttpClient} from "./app/http/http.client";
import {HttpWebsocketClient} from "./app/http/http.ws.client";

ArrayExtensions.setup()

export const Env = {
    API_BASE_URL: import.meta.env.PUB_BACKEND_URL,
    API_WS_BASE_URL: import.meta.env.PUB_BACKEND_WEBSOCKET_URL,
    ENABLE_WEBGL_ERROR_CHECKING: toBoolean(import.meta.env.PUB_ENABLE_WEBGL_ERROR_CHECKING),
    ENABLE_RENDERER_MONITORING: toBoolean(import.meta.env.PUB_ENABLE_RENDERER_MONITORING)
};

GLError.enabled = Env.ENABLE_WEBGL_ERROR_CHECKING;
WebGLMonitor.enabled = Env.ENABLE_RENDERER_MONITORING;

export const httpClient = new NewHttpClient(Env.API_BASE_URL);
export const gameSessionWebsocketClient = new HttpWebsocketClient(Env.API_WS_BASE_URL);


ReactDOM.createRoot(document.getElementById("root")!).render(<App/>);
// !! Do not use Strict-Mode !!!
// Strict-Mode tells react to re-render components twice (calls useEffect 2x) in dev-mode
// ==> Problems with canvas/rendering
// ==> https://reactjs.org/docs/strict-mode.html