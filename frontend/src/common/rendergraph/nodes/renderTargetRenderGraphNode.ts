import {RenderGraphNode} from "../renderGraphNode";
import {DrawRenderGraphNode} from "./drawRenderGraphNode";

export class RenderTargetRenderGraphNode extends RenderGraphNode<RenderTargetRenderGraphNode> {

	private enableDepth: boolean = false;

	public withDepth(enableDepth: boolean = true): RenderTargetRenderGraphNode {
		this.enableDepth = enableDepth;
		return this;
	}

	public withInput(input: DrawRenderGraphNode): RenderTargetRenderGraphNode {
		this.registerInput(input)
		return this;
	}

	public getEnableDepth(): boolean {
		return this.enableDepth;
	}

	validate(): string[] {
		return [];
	}

}