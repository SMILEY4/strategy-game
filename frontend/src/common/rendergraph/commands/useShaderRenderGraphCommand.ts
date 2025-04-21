import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLProgram} from "../../webgl/glProgram";
import {RenderGraphCommand} from "../renderGraphCommand";

export class UseShaderRenderGraphCommand extends RenderGraphCommand {
	private readonly shaderProgramName: string;

	constructor(shaderProgramName: string) {
		super();
		this.shaderProgramName = shaderProgramName;
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