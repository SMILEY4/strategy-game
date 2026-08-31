import {WebGlRenderGraph} from "@modules/rendergraph/render-graph.ts";
import {gameGraph} from "@pages/game/renderer/graph/game-graph.ts";
import {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import {gameRendererDataProvider, type GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import {type GameGraphWasmApi, gameGraphWasmApiJsImplementation} from "@pages/game/renderer/game-graph.wasm-api.ts";
import {DI} from "@app/app.ts";


export class GameRenderer {

    private readonly dataProvider: GameRendererDataProvider;
    private readonly renderGraph: WebGlRenderGraph;
    private readonly wasmApi: GameGraphWasmApi;


    constructor() {
        this.dataProvider = gameRendererDataProvider({ // todo: tech-dept: temporary bypass of actual DI system
            tileDb: DI.tileDatabase,
            cameraDb: DI.cameraDatabase,
            entityDb: DI.entityDatabase,
            commandDb: DI.commandDatabase,
            debugDb: DI.debugDatabase,
            selectedTileDb: DI.selectedTileDatabase,
            mapModeDb: DI.mapModeDatabase,
            pointerPositionDb: DI.pointerPositionDatabase,
        });
        this.wasmApi = gameGraphWasmApiJsImplementation();
        this.renderGraph = WebGlRenderGraph.build(gameGraph(new RenderGraphBuilder(), this.dataProvider, this.wasmApi));
    }

    public initialize(canvas: HTMLCanvasElement): void {
        this.renderGraph.initializeCanvas(canvas);
        this.wasmApi.configureRenderer()
    }

    public update(): void {
        this.renderGraph.execute();
    }

    public resize(canvas: HTMLCanvasElement): void {
        this.renderGraph.onResizeCanvas(canvas);
    }

    public dispose(): void {
        this.renderGraph.dispose();
    }

}