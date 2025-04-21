import {RenderGraphNode} from "../renderGraphNode";
import {DrawRenderGraphNode} from "./drawRenderGraphNode";

/**
 * Node to define a texture as a render target
 *
 * Inputs:
 * - ShaderRenderGraphNode: shader(s) that draw to this target
 */
export class RenderTargetRenderGraphNode extends RenderGraphNode<RenderTargetRenderGraphNode> {

	private readonly inputs: DrawRenderGraphNode[] = [];
	private enableDepth: boolean = false;


	public withDepth(enableDepth: boolean = true) {
		this.enableDepth = enableDepth;
	}

	public withInput(input: DrawRenderGraphNode): RenderTargetRenderGraphNode {
		this.inputs.push(input);
		return this;
	}


	public getEnableDepth(): boolean {
		return this.enableDepth;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.inputs;
	}

}