import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {InitRenderGraphNode} from "../nodes/initRenderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {AbstractPropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";

export class PropertyResourceCreator implements RenderGraphResourceCreator<InitRenderGraphNode> {

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof InitRenderGraphNode;
	}

	create(node: InitRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		node.getInputs().forEach(input => {
			if (input instanceof AbstractPropertyRenderGraphNode) {
				resourceManager.createResource(RenderGraphKeys.property(input), input.getValueProvider(null)(), () => undefined);
			}
		});
	}

}