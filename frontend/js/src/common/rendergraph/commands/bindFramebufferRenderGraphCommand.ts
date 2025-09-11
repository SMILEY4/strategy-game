import {GLFramebuffer} from "../../webgl/glFramebuffer";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphCommand} from "../renderGraphCommand";
import {Camera} from "../../webgl/camera";

export class BindFramebufferRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly framebufferName: string,
		private readonly renderScale: number,
		private readonly cameraPropertyName: string,
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const camera = resourceManager.getResource<Camera>(this.cameraPropertyName);
		const framebuffer = resourceManager.getResource<GLFramebuffer>(this.framebufferName);

		framebuffer.resize(
			camera.getWidth() * this.renderScale,
			camera.getHeight() * this.renderScale,
		);
		framebuffer.bind();
	}

	getDebugData(): object {
		return {
			command: "BindFramebuffer",
			framebufferName: this.framebufferName,
		};
	}
}
