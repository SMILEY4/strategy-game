import {RenderGraphNode} from "../renderGraphNode";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "./propertyConstRenderGraphNode";

export abstract class ProgrammableRenderGraphNode<TOutput, TNode> extends RenderGraphNode<TNode>{

	// todo: validate + remove getInputs !!!!!

	// todo idea:
	//   - create context with all properties at beginning of frame and pass to all nodes/funcs as context
	//   - nodes can only read entries in global context which they have defined as inputs
	//   - avoid executing prop provider func multiple times per frame
	//   - maybe as command compiled from init node and stored as resource


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