import {AbstractRenderNode} from "./abstractRenderNode";
import {Preloader} from "../../../shared/preloader";
import {VertexFullQuadNode} from "../prebuiltnodes/vertexFullquadNode";
import {VertexTilesNode} from "../../game/rendernodes/vertexTilesNode";
import {VertexOverlayNode} from "../../game/rendernodes/vertexOverlayNode";
import {VertexEntitiesNode} from "../../game/rendernodes/vertexEntitiesNode";
import {VertexDetailsNode} from "../../game/rendernodes/vertexDetailsNode";
import {VertexRoutesNode} from "../../game/rendernodes/vertexRoutesNode";
import {DrawTilesWaterNode} from "../../game/rendernodes/drawTilesWaterNode";
import {DrawTilesLandNode} from "../../game/rendernodes/drawTilesLandNode";
import {DrawTilesFogNode} from "../../game/rendernodes/drawTilesFogNode";
import {DrawTilesOverlayNode} from "../../game/rendernodes/drawTilesOverlayNode";
import {DrawEntitiesNode} from "../../game/rendernodes/drawEntitiesNode";
import {DrawDetailsNode} from "../../game/rendernodes/drawDetailsNode";
import {DrawRoutesNode} from "../../game/rendernodes/drawRoutesNode";
import {DrawCombineLayersNode} from "../../game/rendernodes/drawCombineLayersNode";
import {DrawRenderNode} from "./drawRenderNode";
import {NodeInput} from "./nodeInput";

export namespace RenderGraphPreloader {

    export function tempLoad() {
        return preload([ // todo: temporary
            new VertexFullQuadNode(),
            new VertexTilesNode(null as any, null as any, null as any),
            new VertexOverlayNode(null as any, null as any, null as any),
            new VertexEntitiesNode(null as any, null as any, null as any),
            new VertexDetailsNode(null as any, null as any),
            new VertexRoutesNode(null as any, null as any),
            new DrawTilesWaterNode(null as any),
            new DrawTilesLandNode(null as any),
            new DrawTilesFogNode(null as any),
            new DrawTilesOverlayNode(null as any, null as any),
            new DrawEntitiesNode(null as any),
            new DrawDetailsNode(null as any),
            new DrawRoutesNode(null as any),
            new DrawCombineLayersNode(null as any, null as any),
        ])
    }

    export function preload(nodes: AbstractRenderNode[]): Promise<void>{
        const textures = collectTextures(nodes);
        return Preloader.loadImages(textures);
    }

    function collectTextures(nodes: AbstractRenderNode[]): string[] {
        const textures: string[] = [];
        nodes.forEach(node => {
            if(node instanceof DrawRenderNode) {
                node.config.input.forEach(input => {
                    if(input instanceof NodeInput.Texture){
                        textures.push(input.path)
                    }
                })
            }
        })
        return textures
    }

}