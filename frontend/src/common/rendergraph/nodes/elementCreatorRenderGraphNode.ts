import {ProgrammableRenderGraphNode} from "./programmableRenderGraphNode";
import ElementCreationFuncResult = ElementCreatorRenderGraphNode.ElementCreationFuncResult;
import {TilePosition} from "../../../models/tile/tilePosition";

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

}


export namespace ElementCreatorRenderGraphNode {

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

	export interface ElementData {
		elements: any[]
	}
}