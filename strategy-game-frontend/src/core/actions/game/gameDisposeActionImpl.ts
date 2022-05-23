import {GameDisposeAction} from "../../../ports/provided/game/gameDisposeAction";
import {GameCanvasHandle} from "../../service/gameCanvasHandle";
import {Renderer} from "../../service/rendering/renderer";

export class GameDisposeActionImpl implements GameDisposeAction {

    private readonly canvasHandle: GameCanvasHandle;
    private readonly renderer: Renderer;

    constructor(canvasHandle: GameCanvasHandle, renderer: Renderer) {
        this.canvasHandle = canvasHandle;
        this.renderer = renderer;
    }

    perform(): void {
        console.debug("Disposing game")
        this.canvasHandle.set(null);
        this.renderer.dispose();
    }

}