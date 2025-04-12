import {RenderGraphNode} from "../renderGraphNode";
import {IntermediateRenderGraphCommand} from "../intermediateRenderGraphCommand";

export class TextureRenderGraphNode extends RenderGraphNode {

	private imageUrl: string | null = null;

	public withUrl(imageUrl: string): TextureRenderGraphNode {
		this.imageUrl = imageUrl;
		return this;
	}

	getInputs(): RenderGraphNode[] {
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
		const commands: IntermediateRenderGraphCommand[] = []
		// todo: add command to bind texture
		return commands;
	}




}