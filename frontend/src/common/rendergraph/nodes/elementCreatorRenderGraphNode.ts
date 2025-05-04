import {ProgrammableRenderGraphNode} from "./programmableRenderGraphNode";
import {TilePosition} from "../../../models/tile/tilePosition";
import ElementCreationFuncResult = ElementCreatorRenderGraphNode.ElementCreationFuncResult;
import {RenderGraphNode} from "../renderGraphNode";

export class ElementCreatorRenderGraphNode extends ProgrammableRenderGraphNode<ElementCreationFuncResult, ElementCreatorRenderGraphNode> {

	private readonly outputs = new Map<string, ElementCreatorRenderGraphNode.Output>();

	public withOutput(name: string): ElementCreatorRenderGraphNode {
		this.outputs.set(name, new ElementCreatorRenderGraphNode.Output(name, this));
		return this;
	}

	public useOutput(name: string): ElementCreatorRenderGraphNode.Output {
		return this.outputs.get(name)!;
	}

	public getOutputs(): ElementCreatorRenderGraphNode.Output[] {
		return Array.from(this.outputs.values());
	}

	validate(): string[] {
		return [];
	}


}


export namespace ElementCreatorRenderGraphNode {

	export function isType(node: RenderGraphNode<any>): node is ElementCreatorRenderGraphNode {
		return node instanceof ElementCreatorRenderGraphNode;
	}

	export type ElementCreationFuncResult = Map<string, Element[]>

	export interface Element {
		position: TilePosition,
	}

	export class Output {

		public readonly creator: ElementCreatorRenderGraphNode;
		public readonly name: string;

		constructor(name: string, creator: ElementCreatorRenderGraphNode) {
			this.name = name;
			this.creator = creator;
		}
	}

}
