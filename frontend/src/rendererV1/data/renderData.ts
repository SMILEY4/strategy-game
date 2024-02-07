import {GLVertexBuffer} from "../../shared/webgl/glVertexBuffer";
import {GLVertexArray} from "../../shared/webgl/glVertexArray";
import {GLProgram} from "../../shared/webgl/glProgram";
import {GLTexture} from "../../shared/webgl/glTexture";
import {GLFramebuffer} from "../../shared/webgl/glFramebuffer";
import {RenderEntity} from "./builders/entities/renderEntity";
import {MapMode} from "../../models/mapMode";
import {Stamp} from "./builders/stamps/stamp";

export interface RenderData {
    meta: {
        time: number,
        tileMouseOver: number[] | null,
        tileSelected: number[] | null
        grayscale: boolean,
        mapMode: MapMode,
    }
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
        items: RenderEntity[],
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
    },
    routes: {
        framebuffer: GLFramebuffer,
        texture: GLTexture,
        program: GLProgram,
        vertexCount: number,
        vertexBuffer: GLVertexBuffer,
        vertexArray: GLVertexArray
    },
    stamps: {
        dirty: boolean,
        items: Stamp[]
    }
}