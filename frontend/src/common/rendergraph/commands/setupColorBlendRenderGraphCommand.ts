import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";
import {GLError} from "../../webgl/glError";
import {RenderGraphCommand} from "../renderGraphCommand";

/**
 * Sets the color blend mode/function.
 */
export class SetupColorBlendRenderGraphCommand extends RenderGraphCommand {

	private readonly blendFunction: ((gl: WebGL2RenderingContext) => void) | null;
	private readonly renderToTexture: boolean;

	constructor(
		blendFunction: ((gl: WebGL2RenderingContext) => void) | null,
		renderToTexture: boolean,
	) {
		super();
		this.blendFunction = blendFunction;
		this.renderToTexture = renderToTexture;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const gl = resourceManager.getResource<WebGL2RenderingContext>(RenderGraphKeys.gl());

		gl.enable(gl.BLEND);
		if (this.blendFunction == null) {
			gl.blendEquation(gl.FUNC_ADD);
			if (this.renderToTexture) {
				gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			} else {
				gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			}
		} else {
			this.blendFunction(gl);
		}

		GLError.check(gl, "[setup-blend]", "setup blend mode");
	}

	getDebugData(): object {
		return {
			command: "SetupColorBlend",
		};
	}
}