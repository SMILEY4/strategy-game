import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderTargetRenderGraphNode} from "../nodes/renderTargetRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLFramebuffer} from "../../webgl/glFramebuffer";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class FramebufferResourceCreator implements RenderGraphResourceCreator<RenderTargetRenderGraphNode> {

	constructor(
		private readonly gl: WebGL2RenderingContext,
	) {
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof RenderTargetRenderGraphNode;
	}

	create(node: RenderTargetRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		const framebufferName = RenderGraphKeys.framebuffer(node);
		if (!resourceManager.hasResource(framebufferName)) {
			resourceManager.createResource<GLFramebuffer>(
				framebufferName,
				GLFramebuffer.create(this.gl, 1, 1, node.getEnableDepth()),
				it => it.dispose()
			);
		}
	}

}