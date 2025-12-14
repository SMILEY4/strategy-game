import {AudioService} from "./common/audioService";
import {CameraDatabase} from "./state/database/cameraDatabase";
import {CommandDatabase} from "./state/database/commandDatabase";
import {RealmDatabase} from "./state/database/realmDatabase";
import {GameSessionDatabase} from "./state/database/gameSessionDatabase";
import {TileDatabase} from "./state/database/tileDatabase";
import {WorldObjectDatabase} from "./state/database/worldObjectDatabase";
import {WebGLMonitor} from "./common/webgl/monitor/webGLMonitor";
import {GLError} from "./common/webgl/glError";
import {GameRenderer} from "./renderer/gameRenderer";
import {GameChangeTracker} from "./renderer/gameChangeTracker";
import {GameShaderSourceManager} from "./renderer/gameShaderSourceManager";
import {GameTextureAtlasDataManager} from "./renderer/gameTextureAtlasDataManager";
import {WasmGameRenderer} from "./renderer/wasmGameRenderer";
import {WasmGameRendererImpl} from "./renderer/wasm/wasmGameRendererImpl";
import {HttpClient as NewHttpClient} from "./app/http/http.client";

const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;
const ENABLE_WEBGL_ERROR_CHECKING: boolean = import.meta.env.PUB_ENABLE_WEBGL_ERROR_CHECKING === "true";
const ENABLE_RENDERER_MONITORING: boolean = import.meta.env.PUB_ENABLE_RENDERER_MONITORING === "true";

export namespace App {

    console.log("initializing app dependencies.", API_BASE_URL, API_WS_BASE_URL, ENABLE_WEBGL_ERROR_CHECKING, ENABLE_RENDERER_MONITORING);

    GLError.enabled = ENABLE_WEBGL_ERROR_CHECKING;
    WebGLMonitor.enabled = ENABLE_RENDERER_MONITORING;

    // new
    export const httpClient = new NewHttpClient(API_BASE_URL);
    export const WS_BASE_URL = API_WS_BASE_URL;

    // database
    export const cameraDatabase: CameraDatabase = new CameraDatabase();
    export const commandDatabase: CommandDatabase = new CommandDatabase();
    export const realmDatabase: RealmDatabase = new RealmDatabase();
    export const gameSessionDatabase: GameSessionDatabase = new GameSessionDatabase();
    export const tileDatabase: TileDatabase = new TileDatabase();
    export const worldObjectDatabase: WorldObjectDatabase = new WorldObjectDatabase();

    // rendering
    export const wasmGameRenderer: WasmGameRenderer = new WasmGameRendererImpl();
    export const changeTracker: GameChangeTracker = new GameChangeTracker();
    export const shaderSourceManager: GameShaderSourceManager = new GameShaderSourceManager();
    export const textureAtlasDataManager: GameTextureAtlasDataManager = new GameTextureAtlasDataManager();
    export const gameRenderer: GameRenderer = new GameRenderer(changeTracker, shaderSourceManager, textureAtlasDataManager, wasmGameRenderer);

    // utility services
    export const audioService: AudioService = new AudioService();


}
