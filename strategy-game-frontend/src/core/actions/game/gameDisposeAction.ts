import {GameCanvasHandle} from "../../service/gameCanvasHandle";
import {Renderer} from "../../service/rendering/renderer";

/**
 * Clean up the game when leaving the page
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