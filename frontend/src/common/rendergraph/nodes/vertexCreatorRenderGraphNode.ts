import {RenderGraphNode} from "../renderGraphNode";
import {VertexAttribute} from "./vertexDescriptorRenderGraphNode";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";
import CreationFunc = VertexCreatorRenderGraphNode.CreationFunc;

export class VertexCreatorRenderGraphNode extends RenderGraphNode<VertexCreatorRenderGraphNode> {

	private readonly properties: PropertyRenderGraphNode<any>[] = [];
	private func: CreationFunc = null as any;
	private readonly outputs = new Map<string, VertexCreatorRenderGraphNode.Output>();


	public withProperty(property: PropertyRenderGraphNode<any>): VertexCreatorRenderGraphNode {
		// todo: own name for properties valid in creator scope (similar to shader properties)
		this.properties.push(property);
		return this;
	}

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

	public getProperties(): PropertyRenderGraphNode<any>[] {
		return this.properties;
	}

	public getOutputs(): VertexCreatorRenderGraphNode.Output[] {
		return Array.from(this.outputs.values());
	}

	getInputs(): RenderGraphNode<any>[] {
		return [...this.properties];
	}

}


export namespace VertexCreatorRenderGraphNode {

	export type CreationFunc =
		(context: Context) => Map<string, { data: ArrayBuffer, entryCount: number }>;

	export class Context {

		private readonly entries: Map<string, () => any>;

		constructor(entries: Map<string, () => any>) {
			this.entries = entries;
		}

		public get<T>(key: string): T {
			const value = this.entries.get(key)!();
			return null as any; // todo
		}

	}

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