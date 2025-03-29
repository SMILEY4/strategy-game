import {RenderGraphResource} from "./renderGraphResource";
import {GLProgram} from "../../webgl/glProgram";
import {RenderGraphResourceDefinition} from "./renderGraphResourceDefinition";

export class ShaderProgramResource extends RenderGraphResource {

	readonly program: GLProgram

	constructor(key: string, program: GLProgram) {
		super(key);
		this.program = program;
	}

}