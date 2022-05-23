import {GameInitAction} from "../../../ports/provided/game/GameInitAction";
import {Renderer} from "../../service/rendering/renderer";
import {GameCanvasHandle} from "../../service/GameCanvasHandle";

export class GameInitActionImpl implements GameInitAction {

    private readonly canvasHandle: GameCanvasHandle;
    private readonly renderer: Renderer;

    constructor(canvasHandle: GameCanvasHandle, renderer: Renderer) {
        this.canvasHandle = canvasHandle;
        this.renderer = renderer;
    }

    perform(canvas: HTMLCanvasElement): void {
        this.canvasHandle.set(canvas);
        this.renderer.initialize();
    }

}