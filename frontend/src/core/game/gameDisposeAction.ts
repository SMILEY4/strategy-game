import {GameCanvasHandle} from "../rendering/gameCanvasHandle";
import {Renderer} from "../rendering/renderer";

/**
 * Clean up the game, e.g. when leaving the page
 */
export class GameDisposeAction {

    private readonly canvasHandle: GameCanvasHandle;
    private readonly renderer: Renderer;

    constructor(canvasHandle: GameCanvasHandle, renderer: Renderer) {
        this.canvasHandle = canvasHandle;
        this.renderer = renderer;
    }

    perform(): void {
        console.log("disposing game")
        this.canvasHandle.set(null);
        this.renderer.dispose();
    }

}