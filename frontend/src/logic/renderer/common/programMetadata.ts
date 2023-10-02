import {GLProgram, ShaderUniformType, UniformValueType} from "./glProgram";
import Uniform = ProgramMetadata.Uniform;

export namespace ProgramMetadata {

    export interface Data {
        uniforms: Uniform[];
    }

    export interface Uniform {
        name: string,
        type: ShaderUniformType,
    }
}

export class ProgramMetadata {


    public static create(program: GLProgram, data: ProgramMetadata.Data): ProgramMetadata {
        const meta = new ProgramMetadata(program);
        data.uniforms.forEach(uniform => {
            const location = program.getUniformLocation(uniform.name);
            if (location != null) {
                meta.addUniformData(uniform, location);
            } else {
                console.error("Can not find location for uniform", uniform.name, "and program", program.getDebugName());
            }
        });
        return meta;
    }


    private readonly program: GLProgram;
    private readonly uniformData: Map<string, Uniform> = new Map<string, Uniform>;
    private readonly uniformLocations: Map<string, WebGLUniformLocation> = new Map<string, WebGLUniformLocation>;

    constructor(program: GLProgram) {
        this.program = program;
    }

    protected addUniformData(data: Uniform, location: WebGLUniformLocation) {
        this.uniformData.set(data.name, data);
        this.uniformLocations.set(data.name, location);
    }

    public setUniform(name: string, value: UniformValueType) {
        const data = this.uniformData.get(name);
        const location = this.uniformLocations.get(name);
        if (data !== undefined && location !== undefined) {
            this.program.setUniform(name, data.type, value, location);
        } else {
            console.error("Could not set uniform: no metadata for name '" + name + "' found.");
        }
    }

}