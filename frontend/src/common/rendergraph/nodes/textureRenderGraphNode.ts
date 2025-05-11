import {RenderGraphNode} from "../renderGraphNode";
import {GLTexture} from "../../webgl/glTexture";

/**
 * A texture loaded from an image file.
 */
export class TextureRenderGraphNode extends RenderGraphNode<TextureRenderGraphNode> {

	private imageUrl: string | null = null;
	private config: GLTexture.Config | undefined = undefined;

	/**
	 * Specify the url to the image (required)
	 */
	public withUrl(imageUrl: string): TextureRenderGraphNode {
		this.imageUrl = imageUrl;
		return this;
	}

	/**
	 * Specify additional configuration for the texture (e.g. filtering, wrapping, ...)
	 */
	public withConfig(config: GLTexture.Config): TextureRenderGraphNode {
		this.config = config;
		return this;
	}

	/**
	 * @return the url to the image
	 */
	public getImageUrl(): string {
		return this.imageUrl!;
	}

	/**
	 * @return the specified configuration
	 */
	public getConfig(): GLTexture.Config | undefined {
		return this.config;
	}

	validate(): string[] {
		const errors: string[] = [];
		if (!this.imageUrl) {
			errors.push("A valid url is required.");
		}
		return errors;
	}

}