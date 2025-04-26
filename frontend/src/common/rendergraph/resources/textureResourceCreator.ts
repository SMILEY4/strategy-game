import {RenderGraphResourceCreator} from "../renderGraphResourceCreator";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {TextureRenderGraphNode} from "../nodes/textureRenderGraphNode";
import {GLTexture} from "../../webgl/glTexture";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class TextureResourceCreator implements RenderGraphResourceCreator<TextureRenderGraphNode> {

	private readonly gl: WebGL2RenderingContext;

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
	}

	appliesTo(node: RenderGraphNode<any>): boolean {
		return node instanceof TextureRenderGraphNode;
	}

	create(node: TextureRenderGraphNode, resourceManager: RenderGraphResourceManager): void {

		const textureName = RenderGraphKeys.texture(node);
		if (resourceManager.hasResource(textureName)) {
			return;
		}

		const texture = GLTexture.createFromPath(this.gl, node.getImageUrl(), node.getConfig() ?? undefined);
		resourceManager.createResource<GLTexture>(textureName, texture, it => it.dispose());
	}

}