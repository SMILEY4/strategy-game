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

	private readonly gl: WebGL2RenderingContext;
	private readonly debugName: string;
	private readonly type: GLBufferType;
	private readonly usage: GLBufferUsage;
	private readonly handle: WebGLBuffer;
	private size: number = 0;


	constructor(gl: WebGL2RenderingContext, type: GLBufferType, usage: GLBufferUsage, debugName?: string) {
		this.gl = gl;
		this.type = type;
		this.usage = usage;
		this.debugName = debugName ? debugName : "noname";
		this.handle = this.generateHandle();
	}


	private generateHandle(): WebGLBuffer {
		const handle = this.gl.createBuffer();
		if (handle === null) {
			throw new Error("Could not create buffer '" + this.debugName + "'");
		}
		return handle;
	}


	public setData(array: number[]): GLBuffer {
		if (this.handle) {
			const type = GLBuffer.convertBufferType(this.type);
			const usage = GLBuffer.convertBufferUsage(this.usage);
			const data = GLBuffer.packageData(this.type, array);
			this.gl.bindBuffer(type, this.handle);
			this.gl.bufferData(type, data, usage);
			this.size = data.length;
			return this;
		} else {
			throw new Error("Could not set data for buffer '" + this.debugName + "'. Buffer has not been created yet.");
		}
	}

	/**
	 * Deletes this buffer
	 */
	public dispose() {
		this.gl.deleteBuffer(this.handle);
	}


	public use() {
		this.gl.bindBuffer(GLBuffer.convertBufferType(this.type), this.handle);
	}


	public getHandle(): WebGLBuffer {
		return this.handle;
	}


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