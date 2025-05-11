import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {VertexDescriptorRenderGraphNode} from "../nodes/vertexDescriptorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {VertexMetaInfo} from "./vertexMetaInfo";

export class VertexInfoResourceCreator implements RenderGraphResourceCreator<VertexDescriptorRenderGraphNode> {

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof VertexDescriptorRenderGraphNode;
	}

	create(node: VertexDescriptorRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		for (let output of node.getVertexCreatorOutputs()) {
			const name = RenderGraphKeys.vertexInfo(output);
			if (!resourceManager.hasResource(name)) {
				resourceManager.createResource<VertexMetaInfo>(
					name,
					{type: output.type, entryCount: 0},
					() => undefined);
			}
		}
	}

}