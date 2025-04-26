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

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
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