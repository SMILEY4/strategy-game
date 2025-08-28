import {DrawRenderGraphNode} from "./drawRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";

/**
 * Represents a html canvas that can be drawn to using shaders and meshes
 */
export class CanvasRenderGraphNode implements RenderGraphNode {

	private readonly drawNodes: DrawRenderGraphNode[] = [];
	private name: string = UID.generate();


	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): CanvasRenderGraphNode {
		this.name = name
		return this;
	}

	/**
	 * Output the result of the given draw node to this canvas
	 */
	public withInput(input: DrawRenderGraphNode): CanvasRenderGraphNode {
		this.drawNodes.push(input);
		return this;
	}


	validate(): string[] {
		return [];
	}

	getInputs(): RenderGraphNode[] {
		return this.drawNodes;
	}

	getName(): string {
		return this.name;
	}

}