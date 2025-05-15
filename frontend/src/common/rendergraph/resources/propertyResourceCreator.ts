import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {AbstractPropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";

export class PropertyResourceCreator implements RenderGraphResourceCreator<AbstractPropertyRenderGraphNode<any, any>> {

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof AbstractPropertyRenderGraphNode;
	}

	create(node: AbstractPropertyRenderGraphNode<any, any>, resourceManager: RenderGraphResourceManager): void {
		resourceManager.createResource(
			RenderGraphKeys.property(node),
			node.getValueProvider(resourceManager)()
		);
	}

}