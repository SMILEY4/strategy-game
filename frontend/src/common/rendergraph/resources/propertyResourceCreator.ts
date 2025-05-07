import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {InitRenderGraphNode} from "../nodes/initRenderGraphNode";
import {PropertyRenderGraphNode} from "../nodes/propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "../nodes/propertyConstRenderGraphNode";
import {ConditionalRenderGraphNode} from "../nodes/conditionalRenderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";

export class PropertyResourceCreator implements RenderGraphResourceCreator<InitRenderGraphNode> {

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof InitRenderGraphNode;
	}

	create(node: InitRenderGraphNode, resourceManager: RenderGraphResourceManager): void {

		node.getInputs().forEach(input => {

			if (input instanceof PropertyConstRenderGraphNode || input instanceof PropertyRenderGraphNode) {
				this.createResource(resourceManager, input);
			}

			if (input instanceof ConditionalRenderGraphNode) {
				if (input.getOptions().every(it => it.value instanceof PropertyConstRenderGraphNode || it.value instanceof PropertyRenderGraphNode)) {
					this.createResource(resourceManager, input.getOptions()[0].value);
				}
			}

		});
	}

	private createResource(resourceManager: RenderGraphResourceManager, property: PropertyConstRenderGraphNode<any> | PropertyRenderGraphNode<any>) {
		if (property instanceof PropertyConstRenderGraphNode) {
			resourceManager.createResource(RenderGraphKeys.property(property), property.getValue(), () => undefined);
		}
		if (property instanceof PropertyRenderGraphNode) {
			resourceManager.createResource(RenderGraphKeys.property(property), property.getDefault(), () => undefined);
		}
	}

}