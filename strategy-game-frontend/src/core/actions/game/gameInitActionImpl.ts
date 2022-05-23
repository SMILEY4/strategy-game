import {GameInitAction} from "../../../ports/provided/game/gameInitAction";
import {GameCanvasHandle} from "../../service/gameCanvasHandle";
import {Renderer} from "../../service/rendering/renderer";

export class GameInitActionImpl implements GameInitAction {

    private readonly canvasHandle: GameCanvasHandle;
    private readonly renderer: Renderer;

    constructor(canvasHandle: GameCanvasHandle, renderer: Renderer) {
        this.canvasHandle = canvasHandle;
        this.renderer = renderer;
    }

    perform(canvas: HTMLCanvasElement): void {
        console.debug("Initializing game")
        this.canvasHandle.set(canvas);
        this.renderer.initialize();
    }

}