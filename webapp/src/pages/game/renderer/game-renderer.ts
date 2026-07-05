import {KeyboardTracker} from "@pages/game/renderer/keyboard-tracker.ts";
import {CameraController} from "@pages/game/renderer/camera-controller.ts";
import {WebGlRenderGraph} from "@modules/rendergraph/render-graph.ts";
import {gameGraph} from "@pages/game/renderer/graph/game-graph.ts";
import {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import {gameRendererDataProvider, type GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import {type GameGraphWasmApi, gameGraphWasmApiJsImplementation} from "@pages/game/renderer/graph/game-graph-wasm-api.ts";
import {DI} from "@app/app.ts";
import type {RenderCameraData} from "@pages/game/renderer/data/models.ts";

export class GameRenderer {

    private readonly dataProvider: GameRendererDataProvider;
    private readonly keyboardTracker: KeyboardTracker;
    private readonly cameraController: CameraController;
    private readonly renderGraph: WebGlRenderGraph;
    private readonly wasmApi: GameGraphWasmApi;


    constructor() {
        this.dataProvider = gameRendererDataProvider({tileDb: DI.tileDb});
        this.keyboardTracker = new KeyboardTracker();
        this.cameraController = new CameraController(this.dataProvider);
        this.wasmApi = gameGraphWasmApiJsImplementation();
        this.renderGraph = WebGlRenderGraph.build(gameGraph(new RenderGraphBuilder(), this.dataProvider, this.wasmApi));
    }

    public initialize(canvas: HTMLCanvasElement): void {
        this.renderGraph.initializeCanvas(canvas);
    }

    public listen(): void {
        this.keyboardTracker.listen();
    }

    public update(): void {
        this.cameraController.updateMovement(this.keyboardTracker.getKeys());
        this.renderGraph.execute();
    }

    public resize(canvas: HTMLCanvasElement): void {
        this.dataProvider.updateCamera((cameraData: RenderCameraData) => {
            cameraData.aspect = canvas.width / canvas.height;
        });
        this.renderGraph.onResizeCanvas(canvas);
    }

    public mouseMove(mx: number, my: number, buttons: number): void {
        this.cameraController.handleMouseMove(mx, my, 0, 0, buttons);
    }

    public dispose(): void {
        this.renderGraph.dispose();
    }

}