import {BaseRenderLayer} from "./baseRenderLayer";

export class RenderWorld {

    private readonly layers: BaseRenderLayer[];


    constructor(layers: BaseRenderLayer[]) {
        this.layers = layers;
    }

    public getLayers(): BaseRenderLayer[] {
        return this.layers;
    }

    public dispose() {
        this.layers.forEach(layer => layer.dispose());
    }

}
