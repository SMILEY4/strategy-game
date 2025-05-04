import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {ElementCreatorRenderGraphNode} from "../nodes/elementCreatorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {ElementData} from "./elementData";

export class ElementDataResourceCreator implements RenderGraphResourceCreator<ElementCreatorRenderGraphNode> {

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof ElementCreatorRenderGraphNode;
	}

	create(node: ElementCreatorRenderGraphNode, resourceManager: RenderGraphResourceManager): void {

		for (let output of node.getOutputs()) {

			const elementsName = RenderGraphKeys.elementsData(output);

			if (resourceManager.hasResource(elementsName)) {
				continue;
			}

			resourceManager.createResource<ElementData>(elementsName, {elements: []}, it => it.elements.length = 0);
		}

	}


}