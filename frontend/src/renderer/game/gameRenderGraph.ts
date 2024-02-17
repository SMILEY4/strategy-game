import {RenderGraph} from "../core/graph/renderGraph";
import {CombineRenderNode} from "./rendernodes/combineRenderNode";
import {EntityRenderNode} from "./rendernodes/entityRenderNode";
import {FogRenderNode} from "./rendernodes/fogRenderNode";
import {GroundRenderNode} from "./rendernodes/groundRenderNode";
import {OverlayRenderNode} from "./rendernodes/overlayRenderNode";
import {WaterRenderNode} from "./rendernodes/waterRenderNode";
import {EntityVertexNode} from "./rendernodes/entityVertexNode";

export class GameRenderGraph extends RenderGraph {
    constructor() {
        super([
            new EntityVertexNode(),
            new WaterRenderNode(),
            new GroundRenderNode(),
            new OverlayRenderNode(),
            new EntityRenderNode(),
            new FogRenderNode(),
            new CombineRenderNode(),
        ]);
    }
}