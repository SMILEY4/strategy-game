import {GLUniformType, GLUniformValueType} from "../../../shared/webgl/glTypes";


export class ProgramUniformEntry {
    readonly valueConstant: GLUniformValueType | null;
    readonly valueProvider: (() => GLUniformValueType) | null;
    readonly binding: string;
    readonly type: GLUniformType;


    constructor(props: {
        valueConstant: GLUniformValueType | null,
        valueProvider: (() => GLUniformValueType) | null,
        binding: string,
        type: GLUniformType,
    }) {
        this.valueConstant = props.valueConstant;
        this.valueProvider = props.valueProvider;
        this.binding = props.binding;
        this.type = props.type;
    }
}