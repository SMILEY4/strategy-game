import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLTexture} from "../../webgl/glTexture";
import {RenderGraphCommand} from "../renderGraphCommand";

export class BindTextureRenderGraphCommand extends RenderGraphCommand {

	private readonly textureName: string;
	private readonly textureUnit: number;

	constructor(textureName: string, textureUnit: number) {
		super();
		this.textureName = textureName;
		this.textureUnit = textureUnit;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const texture = resourceManager.getResource<GLTexture>(this.textureName);
		texture.bind(this.textureUnit);
	}

	getDebugData(): object {
		return {
			command: "BindTexture",
			textureName: this.textureName,
			textureUnit: this.textureUnit,
		};
	}
}
