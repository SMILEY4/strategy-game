import {GLUniformType, GLUniformValueType} from "../../../shared/webgl/glTypes";

export interface ProgramUniformEntry {
    binding: string,
    type: GLUniformType,
    valueConstant: GLUniformValueType | null,
    valueProvider: (() => GLUniformValueType) | null
}