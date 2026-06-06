import {GameRendererDataProvider} from "@renderer/data/game-renderer-data-provider.ts";
import {KeyboardTracker} from "@renderer/data/keyboard-tracker.ts";
import {CameraController} from "@renderer/data/camera-controller.ts";
import {WebGlRenderGraph} from "@modules/rendergraph/render-graph.ts";
import {gameGraph} from "@renderer/graph/game-graph.ts";
import type {RenderCameraData} from "@renderer/data/models.ts";

export class GameRenderer {

    private readonly dataProvider;
    private readonly keyboardTracker;
    private readonly cameraController;
    private readonly renderGraph;

    constructor() {
        this.dataProvider = new GameRendererDataProvider(80);
        this.keyboardTracker = new KeyboardTracker();
        this.cameraController = new CameraController(this.dataProvider)
        this.renderGraph = WebGlRenderGraph.build(gameGraph(this.dataProvider));
    }

    public initialize(canvas: HTMLCanvasElement): void {
        this.renderGraph.initializeCanvas(canvas);
    }

    public listen(): void {
        this.keyboardTracker.listen()
    }

    public update(): void {
        this.cameraController.updateMovement(this.keyboardTracker.getKeys());
        this.renderGraph.execute();
    }

    public resize(canvas: HTMLCanvasElement): void {
        this.dataProvider.updateCamera((cameraData: RenderCameraData) => {
            cameraData.aspect = canvas.width / canvas.height;
        })
        this.renderGraph.onResizeCanvas(canvas);
    }

    public mouseMove(mx: number, my: number, buttons: number): void {
        this.cameraController.handleMouseMove(mx, my, 0, 0, buttons);
    }

    public dispose(): void {
        this.renderGraph.dispose();
    }

}