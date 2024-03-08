import {AbstractRenderNode} from "./abstractRenderNode";
import {NodeInput} from "./nodeInput";
import {NodeOutput} from "./nodeOutput";

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