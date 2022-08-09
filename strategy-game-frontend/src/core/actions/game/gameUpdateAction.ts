import {Renderer} from "../../service/rendering/renderer";

/**
 * An update of the game loop - called x times per second
 */
export class GameUpdateAction {

    private readonly renderer: Renderer;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    perform(): void {
        try {
            this.renderer.render();
        } catch (e) {
            // ignore exception to not crash render-loop
        }
    }

}