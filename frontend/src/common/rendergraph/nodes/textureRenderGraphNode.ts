import {RenderGraphNode} from "../renderGraphNode";

/**
 * Node to define a texture
 *
 * Properties:
 * - url: the url to the image file
 */
export class TextureRenderGraphNode extends RenderGraphNode<TextureRenderGraphNode> {

	private imageUrl: string | null = null;

	public withUrl(imageUrl: string): TextureRenderGraphNode {
		this.imageUrl = imageUrl;
		return this;
	}

	getInputs(): RenderGraphNode<any>[] {
		return [];
	}

}