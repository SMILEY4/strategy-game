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
	private width: number = 1;
	private height: number = 1;


	public withDepth(enableDepth: boolean = true) {
		this.enableDepth = enableDepth;
	}

	public withSize(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	public withInput(input: DrawRenderGraphNode): RenderTargetRenderGraphNode {
		this.inputs.push(input);
		return this;
	}


	public getEnableDepth(): boolean {
		return this.enableDepth;
	}

	public getWidth(): number {
		return this.width;
	}

	public getHeight(): number {
		return this.height;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.inputs;
	}

}