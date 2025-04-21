import {GLFramebuffer} from "../../webgl/glFramebuffer";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphCommand} from "../renderGraphCommand";

export class BindFramebufferRenderGraphCommand extends RenderGraphCommand {

	private readonly framebufferName: string;

	constructor(framebufferName: string) {
		super();
		this.framebufferName = framebufferName;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const framebuffer = resourceManager.getResource<GLFramebuffer>("framebuffer:" + this.framebufferName);
		framebuffer.bind(); // todo: resize ?
	}

	getDebugData(): object {
		return {
			command: "BindFramebuffer",
			framebufferName: this.framebufferName,
		};
	}
}
