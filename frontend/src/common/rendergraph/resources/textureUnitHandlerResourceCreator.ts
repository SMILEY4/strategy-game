import {InitRenderGraphNode} from "../nodes/initRenderGraphNode";
import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {TextureUnitHandler} from "./textureUnitHandler";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class TextureUnitHandlerResourceCreator implements RenderGraphResourceCreator<InitRenderGraphNode> {

	private readonly gl: WebGL2RenderingContext;

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof InitRenderGraphNode;
	}

	create(node: InitRenderGraphNode, resourceManager: RenderGraphResourceManager): void {
		resourceManager.setResource<TextureUnitHandler>(
			RenderGraphKeys.textureUnitHandler(),
			new TextureUnitHandler(this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS))
		)
	}


}