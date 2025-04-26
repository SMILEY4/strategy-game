import {RenderGraphNode} from "../renderGraphNode";
import {DrawRenderGraphNode} from "./drawRenderGraphNode";

export class RenderTargetRenderGraphNode extends RenderGraphNode<RenderTargetRenderGraphNode> {

	private readonly inputs: DrawRenderGraphNode[] = [];
	private enableDepth: boolean = false;


	public withDepth(enableDepth: boolean = true): RenderTargetRenderGraphNode {
		this.enableDepth = enableDepth;
		return this;
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