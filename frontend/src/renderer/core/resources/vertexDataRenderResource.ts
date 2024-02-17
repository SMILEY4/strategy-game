import {RenderResourceConfig} from "./renderResource";
import {GLVertexBuffer} from "../../../shared/webgl/glVertexBuffer";
import {GLAttributeComponentAmount, GLAttributeType} from "../../../shared/webgl/glTypes";

export interface VertexDataConfig extends RenderResourceConfig {
    /**
     * this resource is of type "vertexdata"
     */
    type: "vertexdata",
    /**
     * the identifying name of the vertex-data
     */
    name: string
}

export interface VertexDataInputConfig extends VertexDataConfig {
}

export interface VertexDataOutputConfig extends VertexDataConfig {
    attributes: VertexDataAttributeConfig[]
}

export interface VertexDataAttributeConfig {
    binding: string,
    type: GLAttributeType,
    amountComponents: GLAttributeComponentAmount,
    normalized?: boolean,
    stride?: number,
    offset?: number,
    divisor?: number,
}


export abstract class VertexDataResource {
}

export namespace VertexDataResource {

    export function generateId(config: VertexDataConfig): string {
        return config.name;
    }

}