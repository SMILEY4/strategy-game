import type {RenderGraphNode} from "@rendergraph/nodes/rg-node.ts";
import type {TextureRenderGraphNode} from "@rendergraph/nodes/rg-node.texture.ts";
import type {RendertargetRenderGraphNode} from "@rendergraph/nodes/rg-node.rendertarget.ts";
import type {GeometryRenderGraphNode} from "@rendergraph/nodes/rg-node.geometry.ts";
import type {ShaderRenderGraphNode} from "@rendergraph/nodes/rg-node.shader.ts";
import type {SelectTextureRenderGraphNode} from "@rendergraph/nodes/rg-node.select-texture.ts";

export interface WebGlDrawCallNode {
    node: RenderGraphNode,
    rendertarget: RendertargetRenderGraphNode | null,
    dependsOn: WebGlDrawCallNode[],
    requiresResources: {
        shader: ShaderRenderGraphNode | null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geometry: GeometryRenderGraphNode<any> | null,
        textures: (TextureRenderGraphNode | RendertargetRenderGraphNode)[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        texturesSelect: SelectTextureRenderGraphNode<any, any>[],
        rendertargets: RendertargetRenderGraphNode[],
    }
}