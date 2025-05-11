import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";

/**
 * Node depending on all nodes. No node depends on this node. Created and managed automatically by render graph.
 */
export class InitRenderGraphNode  implements RenderGraphNode {

	private readonly inputs: RenderGraphNode[] = [];
	private readonly name: string = UID.generate();

	/**
	 * Add the given nodes as dependencies
	 */
	public withInputs(nodes: RenderGraphNode[]): InitRenderGraphNode {
		this.inputs.push(...nodes)
		return this;
	}

	validate(): string[] {
		return [];
	}

	getInputs(): RenderGraphNode[] {
		return this.inputs;
	}

	getName(): string {
		return this.name;
	}

	getChangeTest(): () => boolean {
		return () => false;
	}

}