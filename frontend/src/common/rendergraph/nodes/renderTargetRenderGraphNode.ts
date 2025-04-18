import {RenderGraphNode} from "../renderGraphNode";
import {ShaderRenderGraphNode} from "./shaderRenderGraphNode";

/**
 * Node to define a texture as a render target
 *
 * Inputs:
 * - ShaderRenderGraphNode: shader(s) that draw to this target
 */
export class RenderTargetRenderGraphNode extends RenderGraphNode<RenderTargetRenderGraphNode> {

	private readonly inputs: ShaderRenderGraphNode[] = [];

	public withInput(input: ShaderRenderGraphNode): RenderTargetRenderGraphNode {
		this.inputs.push(input);
		return this;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.inputs;
	}

}