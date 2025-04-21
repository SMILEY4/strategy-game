import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderTargetRenderGraphNode} from "../nodes/renderTargetRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLFramebuffer} from "../../webgl/glFramebuffer";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class FramebufferResourceCreator implements RenderGraphResourceCreator<RenderTargetRenderGraphNode> {

	private readonly gl: WebGL2RenderingContext;

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof RenderTargetRenderGraphNode;
	}

	create(node: RenderTargetRenderGraphNode, resourceManager: RenderGraphResourceManager): void {

		const framebufferName = RenderGraphKeys.framebuffer(node);
		if (resourceManager.hasResource(framebufferName)) {
			return;
		}

		const framebuffer = GLFramebuffer.create(this.gl, node.getWidth(), node.getHeight(), node.getEnableDepth());
		resourceManager.setResource<GLFramebuffer>(framebufferName, framebuffer);
	}

}