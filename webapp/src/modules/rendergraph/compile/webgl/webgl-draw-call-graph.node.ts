import type {TextureRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.texture.ts";
import type {RendertargetRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.rendertarget.ts";
import type {GeometryRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.geometry.ts";
import type {ShaderRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.shader.ts";
import type {SelectTextureRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.select-texture.ts";
import type {DrawRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.draw.ts";

export interface WebGlDrawCallNode {
    node: DrawRenderGraphNode,
    rendertarget: RendertargetRenderGraphNode<any> | null,
    dependsOn: WebGlDrawCallNode[],
    requiresResources: {
        shader: ShaderRenderGraphNode | null,
        geometry: GeometryRenderGraphNode | null,
        textures: (TextureRenderGraphNode | RendertargetRenderGraphNode<any>)[],
        texturesSelect: SelectTextureRenderGraphNode<any, any>[],
        rendertargets: RendertargetRenderGraphNode<any>[],
    }
}