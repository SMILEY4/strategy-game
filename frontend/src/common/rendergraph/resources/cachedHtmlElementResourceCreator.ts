import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {ContainerRenderGraphNode} from "../nodes/containerRenderGraphNode";
import CachedHtmlElement = ContainerRenderGraphNode.CachedHtmlElement;

export class CachedHtmlElementResourceCreator implements RenderGraphResourceCreator<ContainerRenderGraphNode> {

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ContainerRenderGraphNode;
	}

	create(node: ContainerRenderGraphNode, resourceManager: RenderGraphResourceManager): void {

		const elementsName = RenderGraphKeys.cachedHtmlElement(node);

		if (resourceManager.hasResource(elementsName)) {
			return;
		}

		resourceManager.createResource<CachedHtmlElement>(
			elementsName,
			{
				element: null,
				id: node.getElementId(),
			},
			_ => undefined,
		);
	}


}

