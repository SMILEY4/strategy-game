import {BaseRenderLayer} from "../layers/baseRenderLayer";

export class RenderWorld {

    private readonly layers: BaseRenderLayer[];


    constructor(layers: BaseRenderLayer[]) {
        this.layers = layers;
    }

    public getLayers(): BaseRenderLayer[] {
        return this.layers;
    }

    public getLayerById(layerId: number): BaseRenderLayer {
        const layer = this.layers.find(l => l.getLayerId() === layerId)
        if(layer) {
            return layer
        } else {
            throw new Error("Could not find render-layer with id " + layerId)
        }
    }

    public dispose() {
        console.log("DISPOSE WORLD")
        this.layers.forEach(layer => {
            layer.disposeWorldData()
            layer.dispose()
        });
    }

}
