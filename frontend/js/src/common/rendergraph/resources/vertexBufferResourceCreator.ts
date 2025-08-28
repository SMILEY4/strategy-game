import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";
import {VertexGeneratorRenderGraphNode} from "../nodes/vertexGeneratorRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class VertexBufferResourceCreator implements RenderGraphResourceCreator<VertexGeneratorRenderGraphNode> {

	constructor(
		private readonly gl: WebGL2RenderingContext,
	) {
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof VertexGeneratorRenderGraphNode;
	}

	create(node: VertexGeneratorRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		for (let output of node.getOutputDefinitions()) {
			const bufferName = RenderGraphKeys.vertexBuffer(output);
			if (!resourceManager.hasResource(bufferName)) {
				resourceManager.createResource<GLVertexBuffer>(
					bufferName,
					GLVertexBuffer.createEmpty(this.gl),
					it => it.dispose(),
				);
			}
		}
	}

}