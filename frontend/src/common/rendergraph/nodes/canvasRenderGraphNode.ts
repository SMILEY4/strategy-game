import {RenderGraphNode} from "../renderGraphNode";
import {DrawRenderGraphNode} from "./drawRenderGraphNode";

/**
 * Represents a html canvas that can be drawn to using shaders and meshes
 */
export class CanvasRenderGraphNode extends RenderGraphNode<CanvasRenderGraphNode> {

	/**
	 * Output the result of the given draw node to this canvas
	 */
	public withInput(input: DrawRenderGraphNode): CanvasRenderGraphNode {
		this.registerInput(input);
		return this;
	}

	validate(): string[] {
		return [];
	}

}