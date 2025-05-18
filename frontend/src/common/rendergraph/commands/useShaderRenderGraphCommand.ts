import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLProgram} from "../../webgl/glProgram";
import {RenderGraphCommand} from "../renderGraphCommand";

export class UseShaderRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly shaderProgramName: string
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const shaderProgram = resourceManager.getResource<GLProgram>(this.shaderProgramName);
		shaderProgram.use();
	}

	getDebugData(): object {
		return {
			command: "UseShader",
			shaderProgramName: this.shaderProgramName,
		};
	}
}