import {AbstractRenderNode} from "./abstractRenderNode";
import {Preloader} from "../../../shared/preloader";
import {VertexFullQuadNode} from "../prebuilt/vertexFullquadNode";
import {TilesVertexNode} from "../../game/rendernodes/tilesVertexNode";
import {OverlayVertexNode} from "../../game/rendernodes/overlayVertexNode";
import {EntitiesVertexNode} from "../../game/rendernodes/entitiesVertexNode";
import {DetailsVertexNode} from "../../game/rendernodes/detailsVertexNode";
import {RoutesVertexNode} from "../../game/rendernodes/routesVertexNode";
import {TilesWaterDrawNode} from "../../game/rendernodes/tilesWaterDrawNode";
import {TilesLandDrawNode} from "../../game/rendernodes/tilesLandDrawNode";
import {TilesFogDrawNode} from "../../game/rendernodes/tilesFogDrawNode";
import {OverlayDrawNode} from "../../game/rendernodes/overlayDrawNode";
import {EntitiesDrawNode} from "../../game/rendernodes/entitiesDrawNode";
import {DetailsDrawNode} from "../../game/rendernodes/detailsDrawNode";
import {RoutesDrawNode} from "../../game/rendernodes/routesDrawNode";
import {CombineLayersDrawNode} from "../../game/rendernodes/combineLayersDrawNode";
import {DrawRenderNode} from "./drawRenderNode";
import {NodeInput} from "./nodeInput";

export namespace RenderGraphPreloader {

    export function tempLoad() {
        return preload([ // todo: temporary
            new VertexFullQuadNode(),
            new TilesVertexNode(null as any, null as any, null as any),
            new OverlayVertexNode(null as any, null as any),
            new EntitiesVertexNode(null as any),
            new DetailsVertexNode(null as any),
            new RoutesVertexNode(null as any),
            new TilesWaterDrawNode(null as any),
            new TilesLandDrawNode(null as any),
            new TilesFogDrawNode(null as any),
            new OverlayDrawNode(null as any, null as any),
            new EntitiesDrawNode(null as any),
            new DetailsDrawNode(null as any),
            new RoutesDrawNode(null as any),
            new CombineLayersDrawNode(null as any, null as any),
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