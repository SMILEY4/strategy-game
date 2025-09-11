import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";

/**
 * Node depending on all nodes. No node depends on this node. Created and managed automatically by render graph.
 */
export class InitRenderGraphNode implements RenderGraphNode {

	private readonly name: string = "init-" + UID.generate();

	validate(): string[] {
		return [];
	}

	getInputs(): RenderGraphNode[] {
		return [];
	}

	getName(): string {
		return this.name;
	}

}