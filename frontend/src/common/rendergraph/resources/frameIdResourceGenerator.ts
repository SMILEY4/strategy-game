import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {InitRenderGraphNode} from "../nodes/initRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {UID} from "../../uid";

export class FrameIdResourceGenerator implements RenderGraphResourceCreator<InitRenderGraphNode> {

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof InitRenderGraphNode;
	}

	create(node: InitRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		resourceManager.createResource<string>(
			RenderGraphKeys.frameId(),
			UID.generate()
		);
	}

}