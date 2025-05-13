import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderElementGeneratorRenderGraphNode} from "../nodes/renderElementGeneratorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderElementData} from "./renderElementData";

export class RenderElementDataResourceCreator implements RenderGraphResourceCreator<RenderElementGeneratorRenderGraphNode> {

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof RenderElementGeneratorRenderGraphNode;
	}

	create(node: RenderElementGeneratorRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		for (let output of node.getOutputDefinitions()) {
			const elementsName = RenderGraphKeys.elementsData(output);
			if (!resourceManager.hasResource(elementsName)) {
				resourceManager.createResource<RenderElementData>(
					elementsName,
					{elements: []},
					it => it.elements.length = 0,
				);
			}
		}
	}

}