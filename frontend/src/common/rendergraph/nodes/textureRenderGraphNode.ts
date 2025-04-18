import {RenderGraphNode} from "../renderGraphNode";
import {IntermediateRenderGraphCommand} from "../intermediateRenderGraphCommand";

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

	validate(): string[] {
		const errors: string[] = [];
		if (!this.imageUrl) {
			errors.push("missing image url");
		}
		return errors;
	}

	preCompile(): IntermediateRenderGraphCommand[] {
		return [
			new IntermediateRenderGraphCommand.BindTexture(this)
		];
	}

}