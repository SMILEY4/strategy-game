import {WasmRenderApp} from "wasm";
import {renderWasmApiSetup, type RenderWasmApiSetup} from "@pages/game/renderer/wasm/render-wasm-api.setup.ts";
import {renderWasmApiOperations, type RenderWasmApiOperations} from "@pages/game/renderer/wasm/render-wasm-api.operations.ts";
import {renderWasmApiUpload, type RenderWasmApiUpload} from "@pages/game/renderer/wasm/render-wasm-api.upload.ts";
import {renderWasmApiDownload, type RenderWasmApiDownload} from "@pages/game/renderer/wasm/render-wasm-api.download.ts";

export interface RenderWasmApi {
    setup: RenderWasmApiSetup,
    operations: RenderWasmApiOperations,
    upload: RenderWasmApiUpload,
    download: RenderWasmApiDownload,
}

export const gameGraphWasmApiJsImplementation = (): RenderWasmApi => {
    const wasmApp: WasmRenderApp = new WasmRenderApp();
    return {
        setup: renderWasmApiSetup(wasmApp),
        operations: renderWasmApiOperations(wasmApp),
        upload: renderWasmApiUpload(wasmApp),
        download: renderWasmApiDownload(wasmApp),
    };
};
