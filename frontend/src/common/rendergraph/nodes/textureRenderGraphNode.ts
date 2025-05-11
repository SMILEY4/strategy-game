import {GLTexture} from "../../webgl/glTexture";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphProperty} from "./propertyRenderGraphNode";
import {UID} from "../../uid";
import {GLUniformType} from "../../webgl/glTypes";

/**
 * A texture loaded from an image file.
 */
export class TextureRenderGraphNode implements RenderGraphNode, RenderGraphProperty<number> {

	private imageUrl: string | null = null;
	private config: GLTexture.Config | undefined = undefined;
	private name: string = UID.generate();

	public withName(name: string): TextureRenderGraphNode {
		this.name = name;
		return this;
	}

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

	getName(): string {
		return this.name;
	}

	getInputs(): RenderGraphNode[] {
		return [];
	}

	getChangeTest(): () => boolean {
		return () => false
	}

	getType(): GLUniformType | null {
		return GLUniformType.SAMPLER_2D;
	}

	getValueProvider(context: any): () => number {
		if (context) {
			const boundTextures: Map<RenderGraphNode, number> = context;
			return () => boundTextures.get(this)!;
		} else {
			return () => -1;
		}
	}

	validate(): string[] {
		const errors: string[] = [];
		if (!this.imageUrl) {
			errors.push("A valid url is required.");
		}
		return errors;
	}

}