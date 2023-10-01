import {GLError} from "./glError";

export enum GLBufferType {
    ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER,
}

export enum GLBufferUsage {
    STATIC_DRAW,
    DYNAMIC_DRAW,
    STREAM_DRAW
}

export class GLBuffer {

    public static createEmpty(gl: WebGL2RenderingContext, type: GLBufferType, usage: GLBufferUsage, debugName?: string): GLBuffer {
        const handle = GLBuffer.generateHandle(gl)
        return new GLBuffer(gl, handle, type, debugName)
    }

    public static create(gl: WebGL2RenderingContext, type: GLBufferType, usage: GLBufferUsage, array: number[], debugName?: string): GLBuffer {
        const handle = GLBuffer.generateHandle(gl)
        const buffer =  new GLBuffer(gl, handle, type, debugName)
        buffer.setData(type, usage, array)
        return buffer;
    }

    private static generateHandle(gl: WebGL2RenderingContext): WebGLBuffer {
        const handle = gl.createBuffer();
        if (handle === null) {
            throw new Error("Could not create buffer.");
        }
        return handle;
    }


    private readonly gl: WebGL2RenderingContext;
    private readonly debugName: string;
    private readonly handle: WebGLBuffer;
    private readonly type: GLBufferType;
    private size: number = 0;

    constructor(gl: WebGL2RenderingContext, handle: WebGLBuffer, type: GLBufferType, debugName?: string) {
        this.gl = gl;
        this.type = type;
        this.handle = handle;
        this.debugName = debugName ? debugName : "noname";
    }

    /**
     * replace the data of this buffer with the given data.
     */
    public setData(type: GLBufferType, usage: GLBufferUsage, array: number[]): GLBuffer {
        if (this.handle) {
            const typeId = GLBuffer.convertBufferType(type);
            const usageId = GLBuffer.convertBufferUsage(usage);
            const data = GLBuffer.packageData(type, array);
            this.gl.bindBuffer(typeId, this.handle);
            this.gl.bufferData(typeId, data, usageId);
            this.size = data.length;
            GLError.check(this.gl)
            return this;
        } else {
            throw new Error("Could not set data for buffer '" + this.debugName + "'. Buffer has not been created yet.");
        }
    }


    /**
     * Bind this buffer
     */
    public use() {
        this.gl.bindBuffer(GLBuffer.convertBufferType(this.type), this.handle);
        GLError.check(this.gl)
    }


    /**
     * Deletes this buffer
     */
    public dispose() {
        this.gl.deleteBuffer(this.handle);
        GLError.check(this.gl)
    }


    /**
     * Return the webgl-handle
     */
    public getHandle(): WebGLBuffer {
        return this.handle;
    }


    /**
     * @return the size of this buffer (i.e. the amount of elements)
     */
    public getSize(): number {
        return this.size;
    }


    private static packageData(type: GLBufferType, data: number[]) {
        switch (type) {
            case GLBufferType.ARRAY_BUFFER:
                return new Float32Array(data);
            case GLBufferType.ELEMENT_ARRAY_BUFFER:
                return new Uint16Array(data);
        }
    }

    private static convertBufferType(type: GLBufferType): number {
        switch (type) {
            case GLBufferType.ARRAY_BUFFER:
                return WebGL2RenderingContext.ARRAY_BUFFER;
            case GLBufferType.ELEMENT_ARRAY_BUFFER:
                return WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;

        }
    }

    private static convertBufferUsage(type: GLBufferUsage): number {
        switch (type) {
            case GLBufferUsage.STATIC_DRAW:
                return WebGL2RenderingContext.STATIC_DRAW;
            case GLBufferUsage.DYNAMIC_DRAW:
                return WebGL2RenderingContext.DYNAMIC_DRAW;
            case GLBufferUsage.STREAM_DRAW:
                return WebGL2RenderingContext.STREAM_DRAW;
        }
    }

}