import type {GlDisposable} from "@rendergraph/webgl/gl-disposable.ts";
import {GlError} from "@rendergraph/webgl/gl-error.ts";
import {type GlAttributeComponentAmount, GlAttributeType} from "@rendergraph/webgl/gl-program.ts";
import type {GlVertexBuffer} from "@rendergraph/webgl/gl-vertexbuffer.ts";
import type {GlIndexBuffer} from "@rendergraph/webgl/gl-indexbuffer.ts";

/**
 * Configuration of a single attribute of a vertex
 */
export interface AttributeConfig {
    /** The source buffer containing the attribute */
    buffer: GlVertexBuffer;
    /** The location in the shader */
    location: GLuint,
    /** The data type of the attribute */
    type: GlAttributeType,
    /** The amount of components */
    amountComponents: GlAttributeComponentAmount,
    /** Whether integer data should be automatically scaled to a floating-point range (e.g., 0 to 255 mapping to 0.0 to 1.0). */
    normalized?: boolean,
    /** The number of bytes from the start of one vertex to the start of the next. */
    stride?: number,
    /** The byte offset from the beginning of the buffer to the first element of this attribute. */
    offset?: number,
    /** The rate at which the attribute advances during instanced rendering (0 for per-vertex, 1+ for per-instance). */
    divisor?: number,
    /** a readable name of the attribute for logging and debugging */
    debugName?: string
}

/**
 * A webgl vertex array
 */
export class GlVertexArray implements GlDisposable {

    /**
     * Unbind any currently bound vertex buffer
     * @param gl the webgl context
     */
    public static unbind(gl: WebGL2RenderingContext) {
        gl.bindVertexArray(null);
        GlError.check(gl, "bindVertexArray", "un-binding vertex array object");
    }

    /**
     * Create a new vertex array with the given attribute layout
     * @param gl the webgl context
     * @param attributes the layout configuration of the attributes
     * @param indexBuffer an optional index buffer to use
     */
    public static create(gl: WebGL2RenderingContext, attributes: AttributeConfig[], indexBuffer?: GlIndexBuffer) {

        // create new handle
        const vao = gl.createVertexArray();
        GlError.check(gl, "createVertexArray", "creating vertex array object");
        if (vao === null) {
            throw new Error("Could not create vertex array.");
        }

        // bind vertex array
        gl.bindVertexArray(vao);
        GlError.check(gl, "bindVertexArray", "binding vertex array object for creation");

        // configure index buffer (optional)
        indexBuffer?.bind();

        // prepare for attribute configuration
        const buffers = GlVertexArray.getBuffers(attributes);
        const stride = GlVertexArray.calculateStridePerBuffer(attributes, buffers);
        const offset = GlVertexArray.initialOffsets(buffers);
        const bytesLargestType = GlVertexArray.getBytesLargestTypePerBuffer(attributes, buffers);

        // configure attributes
        attributes.forEach(attribute => {

            if (attribute.type == GlAttributeType.PADDING) {
                GlVertexArray.incrementOffset(offset, attribute.buffer, attribute.type.bytes * attribute.amountComponents);
                return;
            }

            if (attribute.location < 0) {
                console.warn("Ignoring vertex attribute with invalid location", attribute.debugName, attribute);
                GlVertexArray.incrementOffset(offset, attribute.buffer, attribute.type.bytes * attribute.amountComponents);
                return;
            }

            // enable
            gl.enableVertexAttribArray(attribute.location);
            GlError.check(gl, "enableVertexAttribArray", "enabling attribute " + attribute.location);

            // bind source buffer
            attribute.buffer.bind();

            const attributeStride = GlVertexArray.isDefined(attribute.stride) ? attribute.stride! : stride.get(attribute.buffer)!;
            const attributeOffset = GlVertexArray.isDefined(attribute.offset) ? attribute.offset! : offset.get(attribute.buffer)!;
            if (attributeStride % bytesLargestType.get(attribute.buffer)! != 0) {
                console.warn("Invalid stride for attribute " + attribute.debugName + ": stride must be a multiple of " + bytesLargestType.get(attribute.buffer)!, "Consider a different layout or add padding.");
            }

            console.log("attribute", attribute, attributeOffset, attributeStride)

            // set attrib pointers
            if (attribute.type.isInteger && attribute.normalized != true) {
                gl.vertexAttribIPointer(
                    attribute.location,
                    attribute.amountComponents,
                    attribute.type.glEnum,
                    attributeStride,
                    attributeOffset,
                );
                GlError.check(gl, "vertexAttribIPointer");
            } else {
                gl.vertexAttribPointer(
                    attribute.location,
                    attribute.amountComponents,
                    attribute.type.glEnum,
                    GlVertexArray.isDefined(attribute.normalized) ? attribute.normalized! : false,
                    attributeStride,
                    attributeOffset,
                );
                GlError.check(gl, "vertexAttribPointer");
            }

            // configure attribute divisor (optional)
            if (attribute.divisor !== undefined) {
                gl.vertexAttribDivisor(attribute.location, attribute.divisor);
            }

            // increment offset
            GlVertexArray.incrementOffset(offset, attribute.buffer, attribute.type.bytes * attribute.amountComponents);
        });

        // unbind vertex array
        gl.bindVertexArray(null);
        GlError.check(gl, "bindVertexArray", "un-binding vertex array object for creation");
        return new GlVertexArray(gl, vao);
    }

    /**
     * Collect all used vertex buffers from the attribute layout config
     * @param attributes the attribute layout config
     * @private
     */
    private static getBuffers(attributes: AttributeConfig[]): GlVertexBuffer[] {
        const buffers: GlVertexBuffer[] = [];
        attributes.forEach(attribute => {
            if (buffers.indexOf(attribute.buffer) === -1) {
                buffers.push(attribute.buffer);
            }
        });
        return buffers;
    }

    /**
     * Build the initial offset values
     * @param buffers the vertex buffers
     * @private
     */
    private static initialOffsets(buffers: GlVertexBuffer[]): Map<GlVertexBuffer, number> {
        const map = new Map<GlVertexBuffer, number>();
        buffers.forEach(buffer => {
            map.set(buffer, 0);
        });
        return map;
    }

    /**
     * Increment the offset for the given buffer
     * @param offsets current offset values for each buffer
     * @param buffer the buffer to increment the offset for
     * @param increment the amount to increment the offset by
     * @private
     */
    private static incrementOffset(offsets: Map<GlVertexBuffer, number>, buffer: GlVertexBuffer, increment: number) {
        const newOffset = offsets.get(buffer)! + increment;
        offsets.set(buffer, newOffset);
    }


    /**
     * Calculates the stride for each buffer
     * @param attributes the attribute layout config
     * @param buffers the vertex buffers
     * @return the stride for each buffer in bytes
     * @private
     */
    private static calculateStridePerBuffer(attributes: AttributeConfig[], buffers: GlVertexBuffer[]): Map<GlVertexBuffer, number> {
        const map = new Map<GlVertexBuffer, number>();
        buffers.forEach(buffer => {
            const bufferAttributes = attributes.filter(attribute => attribute.buffer == buffer);
            map.set(buffer, GlVertexArray.calculateStride(bufferAttributes));
        });
        return map;
    }

    /**
     * Calculate the stride from the list of attributes
     * @param attributes the attributes to include in the stride calculation
     * @return the stride for the given attributes in bytes
     * @private
     */
    private static calculateStride(attributes: AttributeConfig[]): number {
        return attributes
            .map(a => a.amountComponents * a.type.bytes)
            .reduce((a, b) => a + b, 0);
    }

    /**
     * @return the amount of bytes of the largest datatype in each buffer
     * @private
     */
    private static getBytesLargestTypePerBuffer(attributes: AttributeConfig[], buffers: GlVertexBuffer[]): Map<GlVertexBuffer, number> {
        const map = new Map<GlVertexBuffer, number>();
        buffers.forEach(buffer => {
            let bytesLargestType = 0;
            attributes
                .filter(attribute => attribute.buffer == buffer)
                .forEach(attribute => {
                    bytesLargestType = Math.max(bytesLargestType, attribute.type.bytes);
                });
            map.set(buffer, bytesLargestType);
        });
        return map;
    }

    /**
     * @return whether the given value is defined, i.e. not null or undefined
     * @private
     */
    private static isDefined<T>(value: T | null | undefined): value is T {
        return value !== null && value !== undefined;
    }


    private readonly gl: WebGL2RenderingContext;
    private readonly handle: WebGLVertexArrayObject;

    private constructor(gl: WebGL2RenderingContext, handle: WebGLVertexArrayObject) {
        this.gl = gl;
        this.handle = handle;
    }

    /**
     * Bind this vertex array, making it the currently active one
     */
    public bind() {
        this.gl.bindVertexArray(this.handle);
        GlError.check(this.gl, "bindVertexArray", "binding vertex array object");
    }

    /**
     * Unbind this (or any) vertex array.
     */
    public unbind() {
        GlVertexArray.unbind(this.gl);
    }

    public dispose() {
        this.gl.deleteVertexArray(this.handle);
        GlError.check(this.gl, "deleteVertexArray", "disposing vertex array object");
    }

}
