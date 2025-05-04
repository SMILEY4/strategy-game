import {RenderGraphNode} from "../renderGraphNode";
import {DrawRenderGraphNode} from "./drawRenderGraphNode";

/**
 * Represents a render graph node specifically for rendering to canvas.
 */
export class CanvasRenderGraphNode extends RenderGraphNode<CanvasRenderGraphNode> {

	/**
	 * Adds the given draw node as an input to this node
	 */
	public withInput(input: DrawRenderGraphNode): CanvasRenderGraphNode {
		this.registerInput(input);
		return this;
	}

	validate(): string[] {
		return [];
	}

}