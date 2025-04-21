import {GLFramebuffer} from "../../webgl/glFramebuffer";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphCommand} from "../renderGraphCommand";

export class UnbindFramebufferRenderGraphCommand extends RenderGraphCommand {

	private readonly framebufferName: string;

	constructor(framebufferName: string) {
		super();
		this.framebufferName = framebufferName;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const framebuffer = resourceManager.getResource<GLFramebuffer>("framebuffer:" + this.framebufferName);
		framebuffer.unbind();
	}

	getDebugData(): object {
		return {
			command: "UnbindFramebuffer",
			framebufferName: this.framebufferName,
		};
	}
}