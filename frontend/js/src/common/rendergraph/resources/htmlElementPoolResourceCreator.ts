import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderElementGeneratorRenderGraphNode} from "../nodes/renderElementGeneratorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {PooledHtmlElementData} from "./pooledHtmlElementData";

export class HtmlElementPoolResourceCreator implements RenderGraphResourceCreator<RenderElementGeneratorRenderGraphNode> {

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof RenderElementGeneratorRenderGraphNode;
	}

	create(node: RenderElementGeneratorRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		for (let output of node.getOutputDefinitions()) {
			const elementsName = RenderGraphKeys.pooledHtmlElements(output);
			if (!resourceManager.hasResource(elementsName)) {
				resourceManager.createResource<PooledHtmlElementData>(
					elementsName,
					{elements: [], templateElement: null},
					it => it.elements.length = 0
				);
			}
		}
	}

}