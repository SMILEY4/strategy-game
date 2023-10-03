import {GameCanvasHandle} from "../rendering/gameCanvasHandle";
import {Renderer} from "../rendering/renderer";

/**
 * Initialized the game when entering the page
 */
export class GameInitAction {

    private readonly canvasHandle: GameCanvasHandle;
    private readonly renderer: Renderer;

    constructor(canvasHandle: GameCanvasHandle, renderer: Renderer) {
        this.canvasHandle = canvasHandle;
        this.renderer = renderer;
    }

    perform(canvas: HTMLCanvasElement): void {
        console.log("initializing game")
        this.canvasHandle.set(canvas);
        this.renderer.initialize();
    }

}