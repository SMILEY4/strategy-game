import {GLDrawArraysInstancedWrapper} from "./glwrapper/glDrawArraysInstancedWrapper";
import {GLDrawArraysWrapper} from "./glwrapper/glDrawArraysWrapper";
import {GLDrawElementsInstancedWrapper} from "./glwrapper/glDrawElementsInstancedWrapper";
import {GLDrawElementsWrapper} from "./glwrapper/glDrawElementsWrapper";
import {GLBufferWrapper} from "./glwrapper/glBufferWrapper";
import {GLFramebufferWrapper} from "./glwrapper/glFramebufferWrapper";
import {GLProgramWrapper} from "./glwrapper/glProgramWrapper";
import {GLTextureWrapper} from "./glwrapper/glTextureWrapper";
import {GLVertexArrayWrapper} from "./glwrapper/glVertexArrayWrapper";

export class WebGLMonitor {

    private gl: WebGL2RenderingContext | null = null;

    // draw calls
    private wrapperDrawArraysInstanced: GLDrawArraysInstancedWrapper | null = null;
    private wrapperDrawArrays: GLDrawArraysWrapper | null = null;
    private wrapperDrawElementsInstanced: GLDrawElementsInstancedWrapper | null = null;
    private wrapperDrawElements: GLDrawElementsWrapper | null = null;
    // webgl objects
    private wrapperBuffers: GLBufferWrapper | null = null;
    private wrapperFramebuffers: GLFramebufferWrapper | null = null;
    private wrapperPrograms: GLProgramWrapper | null = null;
    private wrapperTextures: GLTextureWrapper | null = null;
    private wrapperVertexArrays: GLVertexArrayWrapper | null = null;

    private readonly data: WebGLMonitor.Data = {
        ...WebGLMonitor.EMPTY_DATA,
    };

    private timeBeginFrame = 0;
    private timeLastFrame = 0;


    public attach(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.wrapperDrawArraysInstanced = new GLDrawArraysInstancedWrapper(this.gl);
        this.wrapperDrawArrays = new GLDrawArraysWrapper(this.gl);
        this.wrapperDrawElementsInstanced = new GLDrawElementsInstancedWrapper(this.gl);
        this.wrapperDrawElements = new GLDrawElementsWrapper(this.gl);
        this.wrapperBuffers = new GLBufferWrapper(this.gl);
        this.wrapperFramebuffers = new GLFramebufferWrapper(this.gl);
        this.wrapperPrograms = new GLProgramWrapper(this.gl);
        this.wrapperTextures = new GLTextureWrapper(this.gl);
        this.wrapperVertexArrays = new GLVertexArrayWrapper(this.gl);
    }

    public reset() {
        if (this.gl) {
            this.wrapperDrawArraysInstanced?.reset();
            this.wrapperDrawArrays?.reset();
            this.wrapperDrawElementsInstanced?.reset();
            this.wrapperDrawElements?.reset();
        }
    }


    public beginFrame() {
        if (this.gl) {
            this.reset();
            this.timeBeginFrame = Date.now();
        }
    }


    public endFrame() {
        if (this.gl) {
            const time = Date.now();
            this.gl.getError(); // sync cpu and gpu
            this.data.fps = 1 / ((time - this.timeLastFrame) / 1000)
            this.data.frameDuration = time - this.timeBeginFrame;
            this.data.countDrawCalls = this.wrapperDrawArraysInstanced!.getCount() + this.wrapperDrawArrays!.getCount() + this.wrapperDrawElementsInstanced!.getCount() + this.wrapperDrawElements!.getCount();
            this.data.countBuffers = this.wrapperBuffers!.getCount();
            this.data.countFramebuffers = this.wrapperFramebuffers!.getCount();
            this.data.countPrograms = this.wrapperPrograms!.getCount();
            this.data.countTextures = this.wrapperTextures!.getCount();
            this.data.countVertexArrays = this.wrapperVertexArrays!.getCount();
            this.timeLastFrame = this.timeBeginFrame;
        }
    }


    public getData(): WebGLMonitor.Data {
        return this.data;
    }
}

export namespace WebGLMonitor {

    export interface Data {
        fps: number,
        frameDuration: number,
        countDrawCalls: number,
        countBuffers: number,
        countFramebuffers: number,
        countPrograms: number,
        countTextures: number,
        countVertexArrays: number
    }

    export const EMPTY_DATA: WebGLMonitor.Data = {
        fps: 0,
        frameDuration: 0,
        countDrawCalls: 0,
        countBuffers: 0,
        countFramebuffers: 0,
        countPrograms: 0,
        countTextures: 0,
        countVertexArrays: 0,
    };
}