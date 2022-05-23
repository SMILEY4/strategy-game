import {GameUpdateAction} from "../../../ports/provided/game/GameUpdateAction";
import {Renderer} from "../../service/rendering/renderer";

export class GameUpdateActionImpl implements GameUpdateAction {

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