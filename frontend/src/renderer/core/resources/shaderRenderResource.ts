import {RenderResourceConfig} from "./renderResource";

export namespace ShaderResource {

    export function generateId(config: ShaderConfig): string {
        return config.vertex + "-" + config.fragment
    }

}

export interface ShaderConfig extends RenderResourceConfig {
    /**
     * this resource is of type "shader"
     */
    type: "shader",
    /**
     * name of the vertex shader source
     */
    vertex: string,
    /**
     * name of the fragment shader source
     */
    fragment: string,
}


export interface ShaderInputConfig extends ShaderConfig {
}

