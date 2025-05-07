import {RenderGraphNode} from "../renderGraphNode";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "./propertyConstRenderGraphNode";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";

export abstract class ProgrammableRenderGraphNode<TOutput, TNode> extends RenderGraphNode<TNode> {

	// todo: validate + remove getInputs !!!!!

	// todo idea:
	//   - create context with all properties at beginning of frame and pass to all nodes/funcs as context
	//   - nodes can only read entries in global context which they have defined as inputs
	//   - avoid executing prop provider func multiple times per frame
	//   - maybe as command compiled from init node and stored as resource


	private readonly properties: ({
		property: (PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any>),
		name: string
	})[] = [];
	private func: (context: RenderGraphNodeContext) => TOutput = () => undefined as any;

	public withProperty(property: PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any>, name: string): TNode {
		// todo: own name for properties valid in creator scope (similar to shader properties)
		this.properties.push({
			property: property,
			name: name,
		});
		return this as unknown as TNode;
	}

	public withFunction(func: (context: RenderGraphNodeContext) => TOutput): TNode {
		this.func = func;
		return this as unknown as TNode;
	}

	public getFunc(): (context: RenderGraphNodeContext) => TOutput {
		return this.func;
	}

	public getProperties(): ({
		property: (PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any>),
		name: string
	})[] {
		return this.properties;
	}

	getInputs(): RenderGraphNode<any>[] {
		return [...this.properties.map(it => it.property)];
	}

}