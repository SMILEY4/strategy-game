import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLError} from "../../webgl/glError";
import {RenderGraphCommand} from "../renderGraphCommand";

/**
 * Sets the clear color
 */
export class SetupClearColorRenderGraphCommand extends RenderGraphCommand {

	private readonly clearColor: number[];

	constructor(clearColor: number[],) {
		super();
		this.clearColor = clearColor;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const gl = resourceManager.getResource<WebGL2RenderingContext>(RenderGraphKeys.gl());

		gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);

		GLError.check(gl, "[gl-clearColor]", "setup clear color");
	}

	getDebugData(): object {
		return {
			command: "SetupClearColor",
		};
	}
}