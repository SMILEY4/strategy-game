import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLTexture} from "../../webgl/glTexture";
import {RenderGraphCommand} from "../renderGraphCommand";

export class BindTextureConditionalRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly textureNames: { value: string; condition: () => boolean }[],
		private readonly textureUnit: number
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const option = this.textureNames.find(it => it.condition());
		if (option) {
			const texture = resourceManager.getResource<GLTexture>(option.value);
			texture.bind(this.textureUnit);
		}
	}

	getDebugData(): object {
		return {
			command: "BindTextureConditional",
			textureNames: this.textureNames.map(it => it.value),
			textureUnit: this.textureUnit,
		};
	}
}
