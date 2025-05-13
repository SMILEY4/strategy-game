import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLTexture} from "../../webgl/glTexture";
import {RenderGraphCommand} from "../renderGraphCommand";

export class BindConditionalTextureRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly textureName: string,
		private readonly textureUnit: number,
		private readonly condition: () => boolean,
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		if (this.condition()) {
			const texture = resourceManager.getResource<GLTexture>(this.textureName);
			texture.bind(this.textureUnit);
		}
	}

	getDebugData(): object {
		return {
			command: "BindConditionalTexture",
			textureName: this.textureName,
			textureUnit: this.textureUnit,
			condition: ""+this.condition,
		};
	}
}
