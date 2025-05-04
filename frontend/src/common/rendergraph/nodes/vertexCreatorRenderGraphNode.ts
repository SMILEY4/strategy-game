import {VertexAttribute} from "./vertexDescriptorRenderGraphNode";
import {ProgrammableRenderGraphNode} from "./programmableRenderGraphNode";
import CreationFuncResult = VertexCreatorRenderGraphNode.VertexCreationFuncResult;

export class VertexCreatorRenderGraphNode extends ProgrammableRenderGraphNode<CreationFuncResult, VertexCreatorRenderGraphNode> {

	private readonly outputs = new Map<string, VertexCreatorRenderGraphNode.Output>();

	public withOutput(name: string, type: "vertices" | "instances", attributes: VertexAttribute[]): VertexCreatorRenderGraphNode {
		this.outputs.set(name, new VertexCreatorRenderGraphNode.Output(name, this, attributes, type));
		return this;
	}

	public useOutput(name: string): VertexCreatorRenderGraphNode.Output {
		return this.outputs.get(name)!;
	}

	public getOutputs(): VertexCreatorRenderGraphNode.Output[] {
		return Array.from(this.outputs.values());
	}

	validate(): string[] {
		return [];
	}

}


export namespace VertexCreatorRenderGraphNode {

	export type VertexCreationFuncResult = Map<string, { data: ArrayBuffer, entryCount: number }>

	export class Output {

		public readonly creator: VertexCreatorRenderGraphNode;
		public readonly name: string;
		public readonly attributes: VertexAttribute[];
		public readonly type: "vertices" | "instances";

		constructor(name: string, creator: VertexCreatorRenderGraphNode, attributes: VertexAttribute[], type: "vertices" | "instances") {
			this.name = name;
			this.creator = creator;
			this.attributes = attributes;
			this.type = type;
		}
	}
}