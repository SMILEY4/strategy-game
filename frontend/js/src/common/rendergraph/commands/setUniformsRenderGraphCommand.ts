import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {GLProgram} from "../../webgl/glProgram";
import {RenderGraphCommand} from "../renderGraphCommand";
import {GLUniformType, GLUniformValueType} from "../../webgl/glTypes";
import {RenderGraphKeys} from "../renderGraphKeys";

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
			if (uniform.resourceName != null) {
				const value = resourceManager.getResource<any>(uniform.resourceName);
				shaderProgram.setUniform(uniform.binding, uniform.type, value);
			}
			if (uniform.constValue != null) {
				shaderProgram.setUniform(uniform.binding, uniform.type, uniform.constValue!);
			}
		}
	}

	getDebugData(): object {
		return {
			command: "SetUniforms",
			uniformNames: this.uniforms.map(it => ({
				bindingName: it.binding,
				constValue: ""+it.constValue,
				dynPropName: ""+it.resourceName,
			})),
			shaderProgramName: this.shaderProgramName,
		};
	}
}


export class ProgramUniformEntry {
	readonly constValue: GLUniformValueType | null;
	readonly resourceName: string | null;
	readonly binding: string;
	readonly type: GLUniformType;


	constructor(props: {
		valueConst?: GLUniformValueType;
		resourceName: string | null;
		binding: string,
		type: GLUniformType,
	}) {
		this.resourceName = props.resourceName;
		this.constValue = props.valueConst === undefined ? null : props.valueConst;
		this.binding = props.binding;
		this.type = props.type;
	}
}