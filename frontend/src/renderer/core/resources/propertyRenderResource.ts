import {RenderResourceConfig} from "./renderResource";
import {GLUniformType, GLUniformValueType} from "../../../shared/webgl/glTypes";

export interface PropertyConfig extends RenderResourceConfig {
    /**
     * this resource is of type "property"
     */
    type: "property",
    /**
     * the constant value of this property (or undefined to use valueProvider)
     */
    valueConstant?: GLUniformValueType,
    /**
     * the function providing the value of this property (or undefined to use valueConstant)
     */
    valueProvider?: (() => GLUniformValueType)
    /**
     * the type of the value
     */
    valueType: GLUniformType
}

export interface PropertyInputConfig extends PropertyConfig {
    /**
     * the binding name in the shader
     */
    binding: string;
}

