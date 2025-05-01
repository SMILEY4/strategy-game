import {RenderGraphNode} from "../renderGraphNode";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "./propertyConstRenderGraphNode";

export abstract class ProgrammableRenderGraphNode<TOutput, TNode> extends RenderGraphNode<TNode>{

	private readonly properties: (PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any>)[] = [];
	private func: (context: ProgrammableNodeContext) => TOutput = () => undefined as any;

	public withProperty(property: PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any>): TNode {
		// todo: own name for properties valid in creator scope (similar to shader properties)
		this.properties.push(property);
		return this as unknown as TNode;
	}

	public withFunction(func: (context: ProgrammableNodeContext) => TOutput): TNode {
		this.func = func;
		return this as unknown as TNode;
	}

	public getFunc(): (context: ProgrammableNodeContext) => TOutput {
		return this.func;
	}

	getInputs(): RenderGraphNode<any>[] {
		return [...this.properties];
	}

}


export class ProgrammableNodeContext {

	private readonly entries = new Map<string, () => any>();

	constructor(entries: Map<string, () => any>) {
		this.entries = entries;
	}

	public get<T>(key: string): T {
		if(this.entries.has(key)) {
			return this.entries.get(key)!();
		} else {
			throw new Error("Could not get vertex creator context entry with key '" + key + "'")
		}
	}

}