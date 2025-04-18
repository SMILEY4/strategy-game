import {RenderGraphNode} from "../renderGraphNode";
import {ShaderRenderGraphNode} from "./shaderRenderGraphNode";

/**
 * Node to define a draw call
 *
 * Inputs:
 * - ShaderRenderGraphNode: shader(s) that draw to this target
 */
export class DrawRenderGraphNode extends RenderGraphNode<DrawRenderGraphNode> {

	private readonly inputs: ShaderRenderGraphNode[] = [];

	public withInput(input: ShaderRenderGraphNode): DrawRenderGraphNode {
		this.inputs.push(input);
		return this;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.inputs;
	}

}