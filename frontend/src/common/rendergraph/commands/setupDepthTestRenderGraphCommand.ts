import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLError} from "../../webgl/glError";
import {RenderGraphCommand} from "../renderGraphCommand";

/**
 * Enables/disables and sets up the depth test.
 */
export class SetupDepthTestRenderGraphCommand extends RenderGraphCommand {

	private readonly enableDepth: boolean;

	constructor(enableDepth: boolean,) {
		super();
		this.enableDepth = enableDepth;
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		const gl = resourceManager.getResource<WebGL2RenderingContext>(RenderGraphKeys.gl());

		if (this.enableDepth) {
			gl.depthRange(0, 1);
			gl.depthMask(true);
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LESS);
		} else {
			gl.disable(gl.DEPTH_TEST);
		}

		GLError.check(gl, "[gl-setupDepth]", "setup depth test");

	}

	getDebugData(): object {
		return {
			command: "SetupDepthTest",
		};
	}
}