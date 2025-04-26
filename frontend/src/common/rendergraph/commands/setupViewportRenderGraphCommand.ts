import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {Camera} from "../../webgl/camera";
import {GLError} from "../../webgl/glError";
import {RenderGraphCommand} from "../renderGraphCommand";

/**
 * Sets the viewport using the current camera
 */
export class SetupViewportRenderGraphCommand extends RenderGraphCommand {

	private readonly scaling: number;

	constructor(scaling: number,) {
		super();
		this.scaling = scaling;
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		const gl = resourceManager.getResource<WebGL2RenderingContext>(RenderGraphKeys.gl());
		const camera = resourceManager.getResource<Camera>(RenderGraphKeys.camera());

		gl.viewport(0, 0, camera.getWidth() * this.scaling, camera.getHeight() * this.scaling);

		GLError.check(gl, "[gl-setupViewport]", "setup viewport");
	}

	getDebugData(): object {
		return {
			command: "SetupViewport",
		};
	}
}