import {GLProgram, ShaderAttributeType, ShaderUniformType, UniformValueType} from "./glProgram";
import {GLBuffer} from "./glBuffer";
import Uniform = ProgramMetadata.Uniform;
import Attribute = ProgramMetadata.Attribute;
import AttributesData = ProgramMetadata.AttributesData;

export namespace ProgramMetadata {

    export interface Data {
        uniforms: Uniform[];
        attributes: Attribute[];
    }

    export interface Uniform {
        name: string,
        type: ShaderUniformType,
    }

    export interface Attribute {
        name: string,
        type: ShaderAttributeType,
        amountComponents: number,
        normalized: boolean,
        stride: number,
        offset: number,
    }

    export interface AttributesData {
        name: string,
        type: ShaderAttributeType,
        amountComponents: 1 | 2 | 3 | 4,
    }
}

export class ProgramMetadata {

    public static createAttribute(name: string, type: ShaderAttributeType, amountComponents: number): Attribute {
        return {
            name: name,
            type: type,
            amountComponents: amountComponents,
            stride: amountComponents * GLProgram.shaderAttributeTypeToBytes(type),
            normalized: false,
            offset: 0,
        };
    }

    public static createAttributes(attributes: AttributesData[]): Attribute[] {
        const strideBytes = attributes
            .map(a => a.amountComponents * GLProgram.shaderAttributeTypeToBytes(a.type))
            .reduce((a, b) => a + b, 0);
        let offsetBytes = 0;
        return attributes.map(a => {
            const attribute = {
                name: a.name,
                type: a.type,
                amountComponents: a.amountComponents,
                stride: strideBytes,
                normalized: false,
                offset: offsetBytes,
            };
            offsetBytes += a.amountComponents * GLProgram.shaderAttributeTypeToBytes(a.type);
            return attribute;
        });
    }

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
        data.attributes.forEach(attribute => {
            const location = program.getAttributeLocation(attribute.name);
            if (location != null) {
                meta.addAttributeData(attribute, location);
            } else {
                console.error("Can not find location for attribute", attribute.name, "and program", program.getDebugName());
            }
        });
        return meta;
    }


    private readonly program: GLProgram;
    private readonly uniformData: Map<string, Uniform> = new Map<string, Uniform>;
    private readonly uniformLocations: Map<string, WebGLUniformLocation> = new Map<string, WebGLUniformLocation>;
    private readonly attributeData: Map<string, Attribute> = new Map<string, Attribute>;
    private readonly attributeLocations: Map<string, GLint> = new Map<string, GLint>;

    constructor(program: GLProgram) {
        this.program = program;
    }

    protected addUniformData(data: Uniform, location: WebGLUniformLocation) {
        this.uniformData.set(data.name, data);
        this.uniformLocations.set(data.name, location);
    }

    protected addAttributeData(data: Attribute, location: GLint) {
        this.attributeData.set(data.name, data);
        this.attributeLocations.set(data.name, location);
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

    public setAttribute(name: string, buffer: GLBuffer) {
        this.setAttributes([name], buffer)
    }

    public setAttributes(names: string[], buffer: GLBuffer) {
        buffer.use();
        names.forEach(name => {
            const data = this.attributeData.get(name);
            const location = this.attributeLocations.get(name);
            if (data !== undefined && location !== undefined) {
                this.program.setAttribute(name, data.type, data.amountComponents, data.normalized, data.stride, data.offset, location);
            } else {
                console.error("Could not set attribute", "no metadata for name '" + name + "' found.");
            }
        });

    }

}