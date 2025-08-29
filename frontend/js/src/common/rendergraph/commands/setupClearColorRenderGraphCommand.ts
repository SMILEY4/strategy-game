import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLError} from "../../webgl/glError";
import {RenderGraphCommand} from "../renderGraphCommand";

export class SetupClearColorRenderGraphCommand extends RenderGraphCommand {

	constructor(
		public readonly clearColor: number[]
	) {
		super();
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