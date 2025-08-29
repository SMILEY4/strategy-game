import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {InitRenderGraphNode} from "../nodes/initRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class WebGLContextResourceCreator implements RenderGraphResourceCreator<InitRenderGraphNode> {

	private readonly gl: WebGL2RenderingContext;

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof InitRenderGraphNode;
	}

	create(node: InitRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		resourceManager.createResource<WebGL2RenderingContext>(
			RenderGraphKeys.gl(),
			this.gl
		);
	}

}