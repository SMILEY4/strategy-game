import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLTexture} from "../../shared/webgl/glTexture";
import {GLFramebuffer} from "../../shared/webgl/glFramebuffer";

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
        },
        vertexCount: number,
        vertexBuffer: GLVertexBuffer,
        vertexArray: GLVertexArray
    },
    entityMask: {
        framebuffer: GLFramebuffer,
        program: GLProgram,
        textures: {
            mask: GLTexture,
        },
        vertexArray: GLVertexArray
    }
}