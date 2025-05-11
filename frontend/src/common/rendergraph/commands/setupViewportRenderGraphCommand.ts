import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {Camera} from "../../webgl/camera";
import {GLError} from "../../webgl/glError";
import {RenderGraphCommand} from "../renderGraphCommand";

export class SetupViewportRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly scaling: number,
		private readonly cameraPropertyName: string
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const gl = resourceManager.getResource<WebGL2RenderingContext>(RenderGraphKeys.gl());
		const camera = resourceManager.getResource<Camera>(this.cameraPropertyName);
		gl.viewport(0, 0, camera.getWidth() * this.scaling, camera.getHeight() * this.scaling);
		GLError.check(gl, "[gl-setupViewport]", "setup viewport");
	}

	getDebugData(): object {
		return {
			command: "SetupViewport",
		};
	}
}