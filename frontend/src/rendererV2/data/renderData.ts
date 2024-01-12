import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLTexture} from "../../shared/webgl/glTexture";
import {MapMode} from "../../models/mapMode";

export interface RenderData {
    meta: {
        time: number,
        tileMouseOver: number[] | null,
        tileSelected: number[] | null
        grayscale: boolean,
        mapMode: MapMode,
    }
    ground: {
        program: GLProgram,
        textures: {
            tileset: GLTexture,
        },
        mesh: {
            vertexCount: number,
            vertexBuffer: GLVertexBuffer
        },
        instances: {
            instanceCount: number,
            instanceBuffer: GLVertexBuffer,
        },
        vertexArray: GLVertexArray
    },
    water: {
        program: GLProgram,
        textures: {
            noise: GLTexture,
        }
        mesh: {
            vertexCount: number,
            vertexBuffer: GLVertexBuffer
        },
        instances: {
            instanceCount: number,
            instanceBuffer: GLVertexBuffer,
        },
        vertexArray: GLVertexArray
    },
    details: {
        program: GLProgram,
        textures: {
            tileset: GLTexture,
        }
        vertexCount: number,
        vertexBuffer: GLVertexBuffer,
        vertexArray: GLVertexArray
    },
    overlay: {
        program: GLProgram,
        mesh: {
            vertexCount: number,
            vertexBuffer: GLVertexBuffer
        },
        instances: {
            instanceCount: number,
            instanceBuffer: GLVertexBuffer,
        },
        vertexArray: GLVertexArray
    }
}