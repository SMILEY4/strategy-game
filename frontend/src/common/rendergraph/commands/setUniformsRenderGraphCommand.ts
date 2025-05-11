import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLProgram} from "../../webgl/glProgram";
import {RenderGraphCommand} from "../renderGraphCommand";
import {GLUniformType, GLUniformValueType} from "../../webgl/glTypes";

export class SetUniformsRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly uniforms: ProgramUniformEntry[],
		private readonly shaderProgramName: string
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager): void {
		const shaderProgram = resourceManager.getResource<GLProgram>(this.shaderProgramName);
		for (let uniform of this.uniforms) {
			if (uniform.valueProvider != null) {
				shaderProgram.setUniform(uniform.binding, uniform.type, uniform.valueProvider!(resourceManager));
			}
			if (uniform.constValue != null) {
				shaderProgram.setUniform(uniform.binding, uniform.type, uniform.constValue!);
			}
		}
	}

	getDebugData(): object {
		return {
			command: "SetUniforms",
			uniformNames: this.uniforms.map(it => [it.binding, ""+it.constValue, ""+it.valueProvider]),
			shaderProgramName: this.shaderProgramName,
		};
	}
}


export class ProgramUniformEntry {
	readonly constValue: GLUniformValueType | null;
	readonly valueProvider: ((resourceManager: RenderGraphResourceManager) => GLUniformValueType) | null;
	readonly binding: string;
	readonly type: GLUniformType;


	constructor(props: {
		valueConst?: GLUniformValueType;
		valueProvider?: (resourceManager: RenderGraphResourceManager) => GLUniformValueType,
		binding: string,
		type: GLUniformType,
	}) {
		this.valueProvider = props.valueProvider === undefined ? null : props.valueProvider;
		this.constValue = props.valueConst === undefined ? null : props.valueConst;
		this.binding = props.binding;
		this.type = props.type;
	}
}