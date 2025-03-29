import {RenderNode} from "../RenderNode";
import {NodeInput} from "./nodeInput";
import {NodeOutput} from "./nodeOutput";

/**
 * Node in a render node that performs a draw-call.
 * Requires as inputs
 * - 1x vertex-descriptor
 * - 1x shader program
 * Requires as output
 * - 1x render-target (or screen)
 */
export class DrawRenderNode<TContext> extends RenderNode {

    public readonly config: DrawRenderNodeConfig<TContext>;

    constructor(config: DrawRenderNodeConfig<TContext>) {
        super(config.id);
        this.config = config;
    }

}

/**
 * The configuration of the node
 */
export interface DrawRenderNodeConfig<TContext> {
    id: string,
    input: (NodeInput.VertexDescriptor | NodeInput.Shader | NodeInput.Texture | NodeInput.ConditionalTexture<TContext> | NodeInput.TextureAtlas | NodeInput.RenderTarget | NodeInput.Property<TContext> | NodeInput.ClearColor | NodeInput.BlendMode)[]
    output: (NodeOutput.RenderTarget | NodeOutput.Screen)[]
}