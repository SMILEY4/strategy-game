import {RenderGraphNode} from "../renderGraphNode";
import {DrawRenderGraphNode} from "./drawRenderGraphNode";

export class CanvasRenderGraphNode extends RenderGraphNode<CanvasRenderGraphNode> {

	private readonly inputs: DrawRenderGraphNode[] = [];

	public withInput(input: DrawRenderGraphNode): CanvasRenderGraphNode {
		this.inputs.push(input);
		return this;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.inputs;
	}

}