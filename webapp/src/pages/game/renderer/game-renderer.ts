import {WebGlRenderGraph} from "@modules/rendergraph/render-graph.ts";
import {gameGraph} from "@pages/game/renderer/graph/game-graph.ts";
import {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import {gameRendererDataProvider, type GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import {type RenderWasmApi, gameGraphWasmApiJsImplementation} from "@pages/game/renderer/wasm/render-wasm-api.ts";
import {DI} from "@app/app.ts";
import {tracer} from "@modules/monitoring/tracer.ts";


export class GameRenderer {

    private readonly dataProvider: GameRendererDataProvider;
    private readonly renderGraph: WebGlRenderGraph;
    private readonly wasmApi: RenderWasmApi;


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
        this.renderGraph = tracer.span({ name: "rendergraph"}, () => WebGlRenderGraph.build(gameGraph(new RenderGraphBuilder(), this.dataProvider, this.wasmApi)));
    }

    public initialize(canvas: HTMLCanvasElement): void {
        void tracer.span({name: "render-init"}, () => {
            this.renderGraph.initializeCanvas(canvas);
            return this.wasmApi.setup.configure();
        });
    }

    public update(): void {
        tracer.span(
            {name: "render-frame"},
            () => this.renderGraph.execute(),
        );
    }

    public resize(canvas: HTMLCanvasElement): void {
        this.renderGraph.onResizeCanvas(canvas);
    }

    public dispose(): void {
        this.renderGraph.dispose();
    }

}
