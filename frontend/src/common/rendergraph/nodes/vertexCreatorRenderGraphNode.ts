import {RenderGraphNode} from "../renderGraphNode";
import {VertexAttribute} from "./vertexDescriptorRenderGraphNode";
import CreationFunc = VertexCreatorRenderGraphNode.CreationFunc;

export class VertexCreatorRenderGraphNode extends RenderGraphNode<VertexCreatorRenderGraphNode> {

	private readonly outputs = new Map<string, VertexCreatorRenderGraphNode.Output>();
	private func: CreationFunc = null as any;

	public withFunction(func: CreationFunc): VertexCreatorRenderGraphNode {
		this.func = func;
		return this;
	}

	public withOutput(name: string, type: "vertices" | "instances", attributes: VertexAttribute[]): VertexCreatorRenderGraphNode {
		this.outputs.set(name, new VertexCreatorRenderGraphNode.Output(name, this, attributes, type));
		return this;
	}

	public useOutput(name: string): VertexCreatorRenderGraphNode.Output {
		return this.outputs.get(name)!;
	}

	public getFunc(): CreationFunc {
		return this.func;
	}

	public getOutputs(): VertexCreatorRenderGraphNode.Output[] {
		return Array.from(this.outputs.values());
	}

	getInputs(): RenderGraphNode<any>[] {
		return [];
	}

}


export namespace VertexCreatorRenderGraphNode {

	export type CreationFunc =
		() => Map<string, { data: ArrayBuffer, entryCount: number }>;

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