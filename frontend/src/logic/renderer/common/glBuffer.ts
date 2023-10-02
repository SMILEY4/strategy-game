import {GLError} from "../common2/glError";
import {isPresent} from "../../../shared/utils";

export enum GLBufferType {
    ARRAY_BUFFER,
    ELEMENT_ARRAY_BUFFER,
}

export enum GLBufferUsage {
    STATIC_DRAW,
    DYNAMIC_DRAW,
    STREAM_DRAW
}

export enum GLBufferAttributeType {
    BYTE, // 8-bit integer [-128, 127]
    SHORT, // 16-bit integer [-32768, 32767]
    INT, // 32-bit integer
    U_BYTE, // unsigned 8-bit integer [0, 255]
    U_SHORT, // unsigned 16-bit integer [0, 65535]
    U_INT, // unsigned 32-bit integer
    FLOAT, // 32-bit IEEE floating point number
    HALF_FLOAT, // 16-bit IEEE floating point number 
}

export interface GLBufferAttribute {
    name: string,
    location: GLint
    type: GLBufferAttributeType,
    amountComponents: 1 | 2 | 3 | 4,
    normalized?: boolean,
    stride?: number,
    offset?: number
}

export interface GLBufferInformation {
    type: GLBufferType,
    usage: GLBufferUsage,
    attributes: GLBufferAttribute[]
    debugName?: string,
}


export class GLBuffer {

    public static create(gl: WebGL2RenderingContext, array: number[], information: GLBufferInformation): GLBuffer {
        const buffer = GLBuffer.createEmpty(gl, information);
        buffer.setData(information.usage, array);
        return buffer;
    }

    public static createRaw(gl: WebGL2RenderingContext, data: ArrayBuffer, size: number, information: GLBufferInformation): GLBuffer {
        const buffer = GLBuffer.createEmpty(gl, information);
        buffer.setDataRaw(information.usage, data, size);
        return buffer;
    }

    public static createEmpty(gl: WebGL2RenderingContext, information: GLBufferInformation): GLBuffer {
        const handle = GLBuffer.generateHandle(gl);
        const buffer = new GLBuffer(gl, handle, information.type, information.debugName);
        GLBuffer.setupAttributes(gl, buffer, information.attributes);
        return buffer;
    }

    private static generateHandle(gl: WebGL2RenderingContext): WebGLBuffer {
        const handle = gl.createBuffer();
        GLError.check(gl, "createBuffer", "generating buffer-handle");
        if (handle === null) {
            throw new Error("Could not create buffer.");
        }
        return handle;
    }

    private static setupAttributes(gl: WebGL2RenderingContext, buffer: GLBuffer, attributes: GLBufferAttribute[]) {
        buffer.use();
        const stride = GLBuffer.calculateStride(attributes);
        let offsetBytes = 0;
        attributes.forEach(attribute => {
            buffer.setAttribute({
                name: attribute.name,
                location: attribute.location,
                type: attribute.type,
                amountComponents: attribute.amountComponents,
                normalized: isPresent(attribute.normalized) ? attribute.normalized : false,
                stride: isPresent(attribute.stride) ? attribute.stride : stride,
                offset: isPresent(attribute.offset) ? attribute.offset : 0,
            });
            offsetBytes += GLBuffer.attributeTypeToBytes(attribute.type) * attribute.amountComponents;
        });
    }

    private static calculateStride(attributes: GLBufferAttribute[]): number {
        return attributes
            .map(a => a.amountComponents * GLBuffer.attributeTypeToBytes(a.type))
            .reduce((a, b) => a + b, 0);
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
    public setData(usage: GLBufferUsage, array: number[]): GLBuffer {
        const data = GLBuffer.packageData(this.type, array);
        return this.setDataRaw(usage, data, array.length);
    }

    /**
     * replace the data of this buffer with the given data.
     */
    public setDataRaw(usage: GLBufferUsage, data: ArrayBuffer, size: number): GLBuffer {
        if (this.handle) {
            const typeId = GLBuffer.convertBufferType(this.type);
            const usageId = GLBuffer.convertBufferUsage(usage);
            this.gl.bindBuffer(typeId, this.handle);
            this.gl.bufferData(typeId, data, usageId);
            this.size = size;
            GLError.check(this.gl, "bindBuffer,bufferData", "setting buffer data");
            return this;
        } else {
            throw new Error("Could not set data for buffer '" + this.debugName + "'. Buffer has not been created yet.");
        }
    }

    /**
     * Set the value of the attribute with the given name. This buffer must be bound first.
     */
    public setAttribute(attribute: GLBufferAttribute) {
        if (!isPresent(attribute.offset) || !isPresent(attribute.stride) || !isPresent(attribute.normalized)) {
            throw new Error("Cannot set attribute: validation failed!");
        }
        this.gl.enableVertexAttribArray(attribute.location);
        GLError.check(this.gl, "enableVertexAttribArray", "setting buffer attribute");
        if (GLBuffer.attributeTypeIsInteger(attribute.type)) {
            this.gl.vertexAttribIPointer(
                attribute.location,
                attribute.amountComponents,
                GLBuffer.attributeTypeToGLType(attribute.type),
                attribute.stride!,
                attribute.offset!,
            );
        } else {
            this.gl.vertexAttribPointer(
                attribute.location,
                attribute.amountComponents,
                GLBuffer.attributeTypeToGLType(attribute.type),
                attribute.normalized!,
                attribute.stride!,
                attribute.offset!,
            );
        }
        GLError.check(this.gl, "enableVertexAttribArray", "setting buffer attribute");
    }


    /**
     * Bind this buffer
     */
    public use() {
        this.gl.bindBuffer(GLBuffer.convertBufferType(this.type), this.handle);
        GLError.check(this.gl, "bindBuffer", "binding buffer");
    }


    /**
     * Deletes this buffer
     */
    public dispose() {
        this.gl.deleteBuffer(this.handle);
        GLError.check(this.gl, "deleteBuffer", "disposing buffer");
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


    public static packageData(type: GLBufferType, data: number[]) {
        switch (type) {
            case GLBufferType.ARRAY_BUFFER:
                return new Float32Array(data);
            case GLBufferType.ELEMENT_ARRAY_BUFFER:
                return new Uint16Array(data);
        }
    }

    public static convertBufferType(type: GLBufferType): number {
        switch (type) {
            case GLBufferType.ARRAY_BUFFER:
                return WebGL2RenderingContext.ARRAY_BUFFER;
            case GLBufferType.ELEMENT_ARRAY_BUFFER:
                return WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER;

        }
    }

    public static convertBufferUsage(type: GLBufferUsage): number {
        switch (type) {
            case GLBufferUsage.STATIC_DRAW:
                return WebGL2RenderingContext.STATIC_DRAW;
            case GLBufferUsage.DYNAMIC_DRAW:
                return WebGL2RenderingContext.DYNAMIC_DRAW;
            case GLBufferUsage.STREAM_DRAW:
                return WebGL2RenderingContext.STREAM_DRAW;
        }
    }

    public static attributeTypeIsInteger(type: GLBufferAttributeType): boolean {
        return type === GLBufferAttributeType.BYTE
            || type === GLBufferAttributeType.SHORT
            || type === GLBufferAttributeType.INT
            || type === GLBufferAttributeType.U_BYTE
            || type === GLBufferAttributeType.U_SHORT
            || type === GLBufferAttributeType.U_INT;
    }

    public static attributeTypeToGLType(type: GLBufferAttributeType): GLenum {
        switch (type) {
            case GLBufferAttributeType.BYTE:
                return WebGL2RenderingContext.BYTE;
            case GLBufferAttributeType.SHORT:
                return WebGL2RenderingContext.SHORT;
            case GLBufferAttributeType.INT:
                return WebGL2RenderingContext.INT;
            case GLBufferAttributeType.U_BYTE:
                return WebGL2RenderingContext.UNSIGNED_BYTE;
            case GLBufferAttributeType.U_SHORT:
                return WebGL2RenderingContext.UNSIGNED_SHORT;
            case GLBufferAttributeType.U_INT:
                return WebGL2RenderingContext.UNSIGNED_INT;
            case GLBufferAttributeType.FLOAT:
                return WebGL2RenderingContext.FLOAT;
            case GLBufferAttributeType.HALF_FLOAT:
                return WebGL2RenderingContext.HALF_FLOAT;
        }
    }

    public static attributeTypeToBytes(type: GLBufferAttributeType): number {
        switch (type) {
            case GLBufferAttributeType.BYTE:
                return 1;
            case GLBufferAttributeType.SHORT:
                return 2;
            case GLBufferAttributeType.INT:
                return 4;
            case GLBufferAttributeType.U_BYTE:
                return 1;
            case GLBufferAttributeType.U_SHORT:
                return 2;
            case GLBufferAttributeType.U_INT:
                return 4;
            case GLBufferAttributeType.FLOAT:
                return 4;
            case GLBufferAttributeType.HALF_FLOAT:
                return 2;
        }
    }

}