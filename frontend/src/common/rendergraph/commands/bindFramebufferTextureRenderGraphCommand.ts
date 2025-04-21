import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLFramebuffer} from "../../webgl/glFramebuffer";
import {RenderGraphCommand} from "../renderGraphCommand";

export class BindFramebufferTextureRenderGraphCommand extends RenderGraphCommand {

	private readonly framebufferName: string;
	private readonly textureUnit: number;

	constructor(framebufferName: string, textureUnit: number) {
		super();
		this.framebufferName = framebufferName;
		this.textureUnit = textureUnit;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const framebuffer = resourceManager.getResource<GLFramebuffer>(this.framebufferName);
		framebuffer.bindTexture(this.textureUnit);
	}

	getDebugData(): object {
		return {
			command: "BindFramebufferTexture",
			framebufferName: this.framebufferName,
			textureUnit: this.textureUnit,
		};
	}
}
