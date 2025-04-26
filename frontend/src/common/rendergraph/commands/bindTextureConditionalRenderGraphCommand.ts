import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLTexture} from "../../webgl/glTexture";
import {RenderGraphCommand} from "../renderGraphCommand";

/**
 * Binds the texture with the given name to the given texture slot.
 */
export class BindTextureConditionalRenderGraphCommand extends RenderGraphCommand {

	private readonly textureNames: { value: string; condition: () => boolean }[];
	private readonly textureUnit: number;

	constructor(textureNames: { value: string; condition: () => boolean }[], textureUnit: number) {
		super();
		this.textureNames = textureNames;
		this.textureUnit = textureUnit;
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
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
