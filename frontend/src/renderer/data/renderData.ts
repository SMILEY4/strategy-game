import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLTexture} from "../../shared/webgl/glTexture";

export interface RenderData {
    tilemap: {
        program: GLProgram,
        textures: {
            tileset: GLTexture,
            texturePaper: GLTexture,
            textureClouds: GLTexture
        },
        mesh: {
            vertexCount: number,
            vertexBuffer: GLVertexBuffer
        },
        instances: {
            instanceCount: number,
            instanceBaseBuffer: GLVertexBuffer,
            instanceOverlayBuffer: GLVertexBuffer
        },
        vertexArray: GLVertexArray
    },
    entities: {
        program: GLProgram,
        textures: {
            tileset: GLTexture,
            mask: GLTexture,
        },
        vertexCount: number,
        vertexBuffer: GLVertexBuffer,
        vertexArray: GLVertexArray
    }
}