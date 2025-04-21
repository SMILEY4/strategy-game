import {RenderGraphNode} from "../renderGraphNode";
import {GLTexture} from "../../webgl/glTexture";

/**
 * Node to define a texture
 *
 * Properties:
 * - url: the url to the image file
 */
export class TextureRenderGraphNode extends RenderGraphNode<TextureRenderGraphNode> {

	private imageUrl: string | null = null;
	private config: GLTexture.Config | undefined = undefined;


	public withUrl(imageUrl: string): TextureRenderGraphNode {
		this.imageUrl = imageUrl;
		return this;
	}

	public withConfig(config: GLTexture.Config): TextureRenderGraphNode {
		this.config = config;
		return this;
	}


	public getImageUrl(): string {
		return this.imageUrl!;
	}

	public getConfig(): GLTexture.Config | undefined {
		return this.config;
	}

	getInputs(): RenderGraphNode<any>[] {
		return [];
	}

}