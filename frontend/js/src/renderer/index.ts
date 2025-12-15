import {WasmGameRenderer} from "./wasmGameRenderer";
import {GameChangeTracker} from "./gameChangeTracker";
import {GameShaderSourceManager} from "./gameShaderSourceManager";
import {GameTextureAtlasDataManager} from "./gameTextureAtlasDataManager";
import {GameRenderer} from "./gameRenderer";
import {WasmGameRendererImpl} from "./wasm/wasmGameRendererImpl";

const wasmGameRenderer: WasmGameRenderer = new WasmGameRendererImpl();
const changeTracker: GameChangeTracker = new GameChangeTracker();
const shaderSourceManager: GameShaderSourceManager = new GameShaderSourceManager();
const textureAtlasDataManager: GameTextureAtlasDataManager = new GameTextureAtlasDataManager();

export const gameRenderer: GameRenderer = new GameRenderer(changeTracker, shaderSourceManager, textureAtlasDataManager, wasmGameRenderer);
