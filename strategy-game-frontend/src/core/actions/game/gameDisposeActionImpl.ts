import {GameDisposeAction} from "../../../ports/provided/game/GameDisposeAction";
import {Renderer} from "../../service/rendering/renderer";
import {GameCanvasHandle} from "../../service/GameCanvasHandle";

export class GameDisposeActionImpl implements GameDisposeAction {

    private readonly canvasHandle: GameCanvasHandle;
    private readonly renderer: Renderer;

    constructor(canvasHandle: GameCanvasHandle, renderer: Renderer) {
        this.canvasHandle = canvasHandle;
        this.renderer = renderer;
    }

    perform(): void {
        this.canvasHandle.set(null);
        this.renderer.dispose();
    }

}