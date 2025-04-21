import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLProgram} from "../../webgl/glProgram";
import {RenderGraphCommand} from "../renderGraphCommand";
import {GLUniformType, GLUniformValueType} from "../../webgl/glTypes";

/**
 * Sets the given uniform values for the given shader
 */
export class SetUniformsRenderGraphCommand extends RenderGraphCommand {
	private readonly shaderProgramName: string;
	private readonly uniforms: ProgramUniformEntry[];

	constructor(uniforms: ProgramUniformEntry[], shaderProgramName: string) {
		super();
		this.uniforms = uniforms;
		this.shaderProgramName = shaderProgramName;
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const shaderProgram = resourceManager.getResource<GLProgram>(this.shaderProgramName);
		for (let uniform of this.uniforms) {
			shaderProgram.setUniform(uniform.binding, uniform.type, uniform.valueProvider(resourceManager));
		}
	}

	getDebugData(): object {
		return {
			command: "SetUniforms",
			uniformNames: this.uniforms.map(it => it.binding),
			shaderProgramName: this.shaderProgramName,
		};
	}
}


export class ProgramUniformEntry {
	readonly valueProvider: (resourceManager: RenderGraphResourceManager) => GLUniformValueType;
	readonly binding: string;
	readonly type: GLUniformType;


	constructor(props: {
		valueProvider: (resourceManager: RenderGraphResourceManager) => GLUniformValueType,
		binding: string,
		type: GLUniformType,
	}) {
		this.valueProvider = props.valueProvider;
		this.binding = props.binding;
		this.type = props.type;
	}
}