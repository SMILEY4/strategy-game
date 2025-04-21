import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLVertexBuffer} from "../../webgl/glVertexBuffer";
import {VertexCreatorRenderGraphNode} from "../nodes/vertexCreatorRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class VertexBufferResourceCreator implements RenderGraphResourceCreator<VertexCreatorRenderGraphNode> {

	private readonly gl: WebGL2RenderingContext;

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof VertexCreatorRenderGraphNode;
	}

	create(node: VertexCreatorRenderGraphNode, resourceManager: RenderGraphResourceManager): void {

		for (let output of node.getOutputs()) {

			const bufferName = RenderGraphKeys.vertexBuffer(output);
			if (resourceManager.hasResource(bufferName)) {
				continue;
			}

			const buffer = GLVertexBuffer.createEmpty(this.gl);
			resourceManager.setResource<GLVertexBuffer>(bufferName, buffer);

		}
	}

}