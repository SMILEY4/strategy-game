import {GLFramebuffer} from "../../webgl/glFramebuffer";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphCommand} from "../renderGraphCommand";
import {Camera} from "../../webgl/camera";
import {RenderGraphKeys} from "../renderGraphKeys";

/**
 * Resizes the framebuffer with the given name to the current camera size and binds it as the render target.
 */
export class BindFramebufferRenderGraphCommand extends RenderGraphCommand {

	private readonly framebufferName: string;
	private readonly renderScale: number;

	constructor(framebufferName: string, renderScale: number) {
		super();
		this.framebufferName = framebufferName;
		this.renderScale = renderScale;
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		const camera = resourceManager.getResource<Camera>(RenderGraphKeys.camera());
		const framebuffer = resourceManager.getResource<GLFramebuffer>(this.framebufferName);

		framebuffer.resize(camera.getWidth() * this.renderScale, camera.getHeight() * this.renderScale);
		framebuffer.bind();
	}

	getDebugData(): object {
		return {
			command: "BindFramebuffer",
			framebufferName: this.framebufferName,
		};
	}
}
