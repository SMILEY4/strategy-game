import {Renderer} from "../../service/rendering/renderer";

export class GameUpdateAction {

    private readonly renderer: Renderer;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    perform(): void {
        try {
            this.renderer.render();
        } catch (e) {
        }
    }

}