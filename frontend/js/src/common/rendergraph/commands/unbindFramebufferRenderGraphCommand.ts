import {GLFramebuffer} from "../../webgl/glFramebuffer";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphCommand} from "../renderGraphCommand";

export class UnbindFramebufferRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly framebufferName: string
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const framebuffer = resourceManager.getResource<GLFramebuffer>(this.framebufferName);
		framebuffer.unbind();
	}

	getDebugData(): object {
		return {
			command: "UnbindFramebuffer",
			framebufferName: this.framebufferName,
		};
	}
}