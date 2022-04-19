export enum GLBufferType {
	ARRAY_BUFFER,
	ELEMENT_ARRAY_BUFFER,
}

export enum GLBufferUsage {
	STATIC_DRAW,
	DYNAMIC_DRAW,
	STREAM_DRAW
}

export interface GLBufferData {
	debugName?: string,
	type: GLBufferType,
	usage: GLBufferUsage,
	data?: number[],
}

class GLBuffer {

	data: GLBufferData;
	handle: WebGLBuffer | null = null;
	size: number = 0;

	constructor(data: GLBufferData) {
		this.data = data;
		this.data.debugName = this.data.debugName ? this.data.debugName : "noname";
	}

	public create(gl: WebGL2RenderingContext): GLBuffer {
		this.handle = gl.createBuffer();
		if (this.handle === null) {
			throw new Error("Could not create buffer '" + this.data.debugName + "'");
		}
		if (this.data.data) {
			this.setData(gl, this.data.data);
		}
		return this;
	}


	public setData(gl: WebGL2RenderingContext, data: number[]) {
		if (this.handle) {
			const type = GLBuffer.convertBufferType(this.data.type);
			const usage = GLBuffer.convertBufferUsage(this.data.usage);
			gl.bindBuffer(type, this.handle);
			gl.bufferData(type, this.createData(data), usage);
			gl.bindBuffer(type,null);
			this.size = data.length;
		} else {
			throw new Error("Could not set data for buffer '" + this.data.debugName + "'. Buffer has not been created yet.");
		}
	}

	/**
	 * Deletes this buffer
	 * @param gl the rendering context
	 */
	public dispose(gl: WebGL2RenderingContext) {
		if (this.handle) {
			gl.deleteBuffer(this.handle);
		}
	}

	public use(gl: WebGL2RenderingContext) {
		gl.bindBuffer(GLBuffer.convertBufferType(this.data.type), this.handle);
	}

	public stop(gl: WebGL2RenderingContext) {
		gl.bindBuffer(GLBuffer.convertBufferType(this.data.type), null);
	}

	public getHandle(): WebGLBuffer {
		if (this.handle === null) {
			throw new Error("handle is null. Buffer has not been created yet.");
		} else {
			return this.handle;
		}
	}

	public getHandleOrNull(): WebGLBuffer | null {
		return this.handle;
	}

	public getSize(): number {
		return this.size;
	}

	private createData(data: number[]) {
		switch (this.data.type) {
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

export default GLBuffer;