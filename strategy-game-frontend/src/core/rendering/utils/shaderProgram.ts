import {glErrorToString} from "./webglErrors";
import GLBuffer from "./glBuffer";


export enum ShaderAttributeType {
	BYTE, // 8-bit integer [-128, 127]
	SHORT, // 16-bit integer [-32768, 32767]
	U_BYTE, // unsigned 8-bit integer [0, 255]
	U_SHORT, // unsigned 16-bit integer [0, 65535]
	FLOAT, // 32-bit IEEE floating point number
	HALF_FLOAT, // 16-bit IEEE floating point number
}

export interface ShaderAttributeData {
	name: string, // the name of the attribute in the shader
	amountComponents: number, // the amount of components per iteration. Must be 1,2,3 or 4 (e.g. "3" for x,y,z)
	type: ShaderAttributeType, // the datatype (e.g. "gl.FLOAT")
	normalized?: boolean, // whether to normalize the data into a certain range ( [-1,1] or [0,1] depending on type ). Has no effect on floats. Default = false
	stride?: number, // the offset (in elements) between beginning of consecutive vertex attributes (i.e. the space between each "data-package").  Default = 0
	offset?: number // the offset (in elements) at the beginning.  Default = 0
}

export enum ShaderUniformType {
	FLOAT,
	FLOAT_ARRAY,
	VEC2,
	VEC2_ARRAY,
	VEC3,
	VEC3_ARRAY,
	VEC4,
	VEC4_ARRAY,
	INT,
	INT_ARRAY,
	INT_VEC2,
	INT_VEC2_ARRAY,
	INT_VEC3,
	INT_VEC3_ARRAY,
	INT_VEC4,
	INT_VEC4_ARRAY,
	SAMPLER_2D,
	SAMPLER_2D_ARRAY,
	SAMPLER_CUBE,
	SAMPLER_CUBE_ARRAY,
	MAT2,
	MAT2_ARRAY,
	MAT3,
	MAT3_ARRAY,
	MAT4,
	MAT4_ARRAY,
	BOOL,
	BOOL_VEC2,
	BOOL_VEC3,
	BOOL_VEC4,

}

export interface ShaderUniformData {
	name: string, // the name of the uniform in the shader
	type: ShaderUniformType, // the type of the uniform data
	defaultValue?: number | number[], // the default value of this uniform if no other is specified
}

export interface ShaderProgramData {
	debugName?: string, // an optional name of this shader for debugging/logging.
	sourceVertex: string, // the source code of the vertex shader
	sourceFragment: string, // the source code of the fragment shader
	attributes: ShaderAttributeData[], // the data about attributes
	uniforms: ShaderUniformData[], // the data about uniforms
}

export interface ShaderRuntimeData {
	attributeBuffers?: Map<string, WebGLBuffer> | object,
	uniformValues?: Map<string, number[]> | object
}

class ShaderProgram {

	data: ShaderProgramData;
	programHandle: WebGLProgram | null = null;
	attributeLocations: Map<string, GLint> = new Map();
	uniformLocations: Map<string, WebGLUniformLocation> = new Map();

	/**
	 * Constructor. Will not automatically create the webgl-handles and is not immediately usable.
	 */
	constructor(data: ShaderProgramData) {
		this.data = data;
		this.data.debugName = this.data.debugName ? this.data.debugName : "noname";
	}


	/**
	 * Creates the webgl-handles. Shader is usable after a successful create.
	 * @param gl the rendering context
	 * @return this for chaining
	 */
	public create(gl: WebGL2RenderingContext): ShaderProgram {
		const shaderVertex = ShaderProgram.createShader(gl, "vertex", this.data.sourceVertex);
		const shaderFragment = ShaderProgram.createShader(gl, "fragment", this.data.sourceFragment);
		this.programHandle = ShaderProgram.createShaderProgram(gl, shaderVertex, shaderFragment);
		this.attributeLocations = ShaderProgram.getAttributeLocations(gl, this.programHandle, this.data.attributes);
		this.uniformLocations = ShaderProgram.getUniformLocations(gl, this.programHandle, this.data.uniforms);
		return this;
	}

	/**
	 * Deletes this shader program
	 * @param gl the rendering context
	 */
	public dispose(gl: WebGL2RenderingContext) {
		if (this.programHandle) {
			gl.deleteProgram(this.programHandle);
		}
	}

	/**
	 * Starts using this shader
	 * @param gl the rendering context
	 * @param data the data/values for attributes and uniforms (if required)
	 */
	public use(gl: WebGL2RenderingContext, data: ShaderRuntimeData) {
		if (this.programHandle != null) {
			// start using this program
			gl.useProgram(this.programHandle);
			// set attribute values
			const attributeBufferMap = data.attributeBuffers ? (data.attributeBuffers instanceof Map ? data.attributeBuffers : new Map(Object.entries(data.attributeBuffers))) : new Map();
			this.data.attributes.forEach((attribute) => {
				if (this.attributeLocations.has(attribute.name) && attributeBufferMap.has(attribute.name)) {
					this.setAttributeValue(gl, attribute, attributeBufferMap.get(attribute.name)!);
				}
			});
			// set uniform values
			const uniformValuesMap = data.uniformValues ? (data.uniformValues instanceof Map ? data.uniformValues : new Map(Object.entries(data.uniformValues))) : new Map();
			this.data.uniforms.forEach((uniform) => {
				if (this.uniformLocations.has(uniform.name)) {
					const value = uniformValuesMap.has(uniform.name) ? uniformValuesMap.get(uniform.name)! : uniform.defaultValue;
					if (value !== null && value !== undefined) {
						this.setUniformValue(gl, uniform, value);
					}
				}
			});
		} else {
			throw new Error("Could not use shader program '" + this.data.debugName + "'. Program has not been created yet.");
		}
	}


	private setAttributeValue(gl: WebGL2RenderingContext, attribute: ShaderAttributeData, buffer: WebGLBuffer | GLBuffer) {
		const bufferHandle: WebGLBuffer = (buffer instanceof GLBuffer) ? buffer.getHandle() : buffer;
		// start using a buffer for the current attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferHandle);
		// enable the current attribute
		const location = this.attributeLocations.get(attribute.name)!;
		gl.enableVertexAttribArray(location);
		// tell webgl how to get data out of the currently bound buffer
		gl.vertexAttribPointer(
			location,
			attribute.amountComponents,
			ShaderProgram.shaderAttributeTypeToGLType(attribute.type),
			attribute.normalized === undefined ? false : attribute.normalized,
			attribute.stride ? (attribute.stride * ShaderProgram.shaderAttributeTypeToBytes(attribute.type)) : 0,
			attribute.offset ? (attribute.offset * ShaderProgram.shaderAttributeTypeToBytes(attribute.type)) : 0
		);
	}


	private setUniformValue(gl: WebGL2RenderingContext, uniform: ShaderUniformData, values: number[]) {
		const location = this.uniformLocations.get(uniform.name);
		if (location === null || location === undefined) {
			return;
		}
		switch (uniform.type) {
			case ShaderUniformType.FLOAT:
				gl.uniform1f(location, values[0]);
				break;
			case ShaderUniformType.FLOAT_ARRAY:
				gl.uniform1fv(location, values);
				break;
			case ShaderUniformType.VEC2:
				gl.uniform2f(location, values[0], values[1]);
				break;
			case ShaderUniformType.VEC2_ARRAY:
				gl.uniform2fv(location, values);
				break;
			case ShaderUniformType.VEC3:
				gl.uniform3f(location, values[0], values[1], values[2]);
				break;
			case ShaderUniformType.VEC3_ARRAY:
				gl.uniform3fv(location, values);
				break;
			case ShaderUniformType.VEC4:
				gl.uniform4f(location, values[0], values[1], values[2], values[3]);
				break;
			case ShaderUniformType.VEC4_ARRAY:
				gl.uniform4fv(location, values);
				break;
			case ShaderUniformType.BOOL:
			case ShaderUniformType.SAMPLER_2D:
			case ShaderUniformType.SAMPLER_CUBE:
			case ShaderUniformType.INT:
				gl.uniform1i(location, values[0]);
				break;
			case ShaderUniformType.SAMPLER_2D_ARRAY:
			case ShaderUniformType.SAMPLER_CUBE_ARRAY:
			case ShaderUniformType.INT_ARRAY:
				gl.uniform1iv(location, values);
				break;
			case ShaderUniformType.BOOL_VEC2:
			case ShaderUniformType.INT_VEC2:
				gl.uniform2i(location, values[0], values[1]);
				break;
			case ShaderUniformType.INT_VEC2_ARRAY:
				gl.uniform2iv(location, values);
				break;
			case ShaderUniformType.BOOL_VEC3:
			case ShaderUniformType.INT_VEC3:
				gl.uniform3i(location, values[0], values[1], values[2]);
				break;
			case ShaderUniformType.INT_VEC3_ARRAY:
				gl.uniform3iv(location, values);
				break;
			case ShaderUniformType.BOOL_VEC4:
			case ShaderUniformType.INT_VEC4:
				gl.uniform4i(location, values[0], values[1], values[2], values[3]);
				break;
			case ShaderUniformType.INT_VEC4_ARRAY:
				gl.uniform4iv(location, values);
				break;
			case ShaderUniformType.MAT2:
			case ShaderUniformType.MAT2_ARRAY:
				gl.uniformMatrix2fv(location, false, values);
				break;
			case ShaderUniformType.MAT3:
			case ShaderUniformType.MAT3_ARRAY:
				gl.uniformMatrix3fv(location, false, values);
				break;
			case ShaderUniformType.MAT4:
			case ShaderUniformType.MAT4_ARRAY:
				gl.uniformMatrix4fv(location, false, values);
				break;
		}
	}


	public getHandle(): WebGLProgram {
		if (this.programHandle === null) {
			throw new Error("handle is null. Shader has not been created yet.");
		} else {
			return this.programHandle;
		}
	}

	public getHandleOrNull(): WebGLProgram | null {
		return this.programHandle;
	}

	public getAttributeLocation(name: string): GLint | null {
		const loc = this.attributeLocations.get(name);
		return loc !== undefined ? loc : null;
	}


	private static createShader(gl: WebGL2RenderingContext, type: "vertex" | "fragment", source: string): WebGLShader {
		// create a new shader handle
		const shader = gl.createShader(type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
		if (!shader) {
			throw new Error("Could not create " + type + " shader");
		}
		// upload and compile shader-source
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		// check status if successful
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			return shader;
		} else {
			gl.deleteShader(shader);
			throw new Error("Error during " + type + " shader creation: " + glErrorToString(gl.getError()) + " - " + gl.getShaderInfoLog(shader));
		}
	}


	private static createShaderProgram(gl: WebGL2RenderingContext, shaderVertex: WebGLShader, vertexFragment: WebGLShader): WebGLProgram {
		// create a new program handle
		const program = gl.createProgram();
		if (!program) {
			throw new Error("Could not create shader program");
		}
		// attach the vertex and fragment shaders to the created program
		gl.attachShader(program, shaderVertex);
		gl.attachShader(program, vertexFragment);
		// complete shader program creation
		gl.linkProgram(program);
		// check status if successful
		if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
			return program;
		} else {
			gl.deleteProgram(program);
			throw new Error("Error during shader program creation: " + glErrorToString(gl.getError()) + " - " + gl.getProgramInfoLog(program));
		}
	}


	private static getAttributeLocations(gl: WebGL2RenderingContext, program: WebGLProgram, attributeData: ShaderAttributeData[]): Map<string, GLint> {
		const locations: Map<string, GLint> = new Map();
		attributeData.forEach(attrib => {
			// find the location/index of the attribute
			const location: GLint = gl.getAttribLocation(program, attrib.name);
			// save location if exists
			if (location >= 0) {
				locations.set(attrib.name, location);
			} else {
				console.error("Could not find attribute location for '" + attrib.name + "'. Continuing without location.");
			}
		});
		return locations;
	}


	private static getUniformLocations(gl: WebGL2RenderingContext, program: WebGLProgram, uniformData: ShaderUniformData[]): Map<string, WebGLUniformLocation> {
		const locations: Map<string, WebGLUniformLocation> = new Map();
		uniformData.forEach(uniform => {
			// find the location/index of the uniform
			const location: WebGLUniformLocation | null = gl.getUniformLocation(program, uniform.name);
			// save location if exists
			if (location !== null) {
				locations.set(uniform.name, location);
			} else {
				console.error("Could not find uniform location for '" + uniform.name + "'. Continuing without location.");
			}
		});
		return locations;
	}


	private static shaderAttributeTypeToGLType(type: ShaderAttributeType): GLenum {
		switch (type) {
			case ShaderAttributeType.BYTE:
				return WebGL2RenderingContext.BYTE;
			case ShaderAttributeType.SHORT:
				return WebGL2RenderingContext.SHORT;
			case ShaderAttributeType.U_BYTE:
				return WebGL2RenderingContext.UNSIGNED_BYTE;
			case ShaderAttributeType.U_SHORT:
				return WebGL2RenderingContext.UNSIGNED_SHORT;
			case ShaderAttributeType.FLOAT:
				return WebGL2RenderingContext.FLOAT;
			case ShaderAttributeType.HALF_FLOAT:
				return WebGL2RenderingContext.HALF_FLOAT;
		}
	}


	private static shaderAttributeTypeToBytes(type: ShaderAttributeType): number {
		switch (type) {
			case ShaderAttributeType.BYTE:
				return 1;
			case ShaderAttributeType.SHORT:
				return 2;
			case ShaderAttributeType.U_BYTE:
				return 1;
			case ShaderAttributeType.U_SHORT:
				return 2;
			case ShaderAttributeType.FLOAT:
				return 4;
			case ShaderAttributeType.HALF_FLOAT:
				return 2;

		}
	}

}

export default ShaderProgram;