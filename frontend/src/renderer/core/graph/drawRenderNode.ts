import {AbstractRenderNode} from "./abstractRenderNode";
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
export class DrawRenderNode extends AbstractRenderNode {

    public readonly config: DrawRenderNodeConfig;

    constructor(config: DrawRenderNodeConfig) {
        super(config.id);
        this.config = config;
    }

}

/**
 * The configuration of the node
 */
export interface DrawRenderNodeConfig {
    id: string,
    input: (NodeInput.VertexDescriptor | NodeInput.Shader | NodeInput.Texture | NodeInput.RenderTarget | NodeInput.Property | NodeInput.ClearColor)[]
    output: (NodeOutput.RenderTarget | NodeOutput.Screen)[]
}