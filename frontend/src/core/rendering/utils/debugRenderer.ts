import SRC_SHADER_VERTEX from "./debugShader.vsh?raw";
import SRC_SHADER_FRAGMENT from "./debugShader.fsh?raw";
import {ShaderProgram, ShaderAttributeType, ShaderUniformType} from "./shaderProgram";
import {GLBuffer, GLBufferType, GLBufferUsage} from "./glBuffer";

export class DebugRenderer {

	private shader: ShaderProgram;

	private dirty: boolean = false;
	private data: number[] = [];
	private bufferData: GLBuffer | null = null;


	public constructor(gl: WebGL2RenderingContext) {
		this.shader = new ShaderProgram(gl, {
			debugName: "debug",
			sourceVertex: SRC_SHADER_VERTEX,
			sourceFragment: SRC_SHADER_FRAGMENT,
			attributes: [
				{
					name: "in_position",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 2,
				},
				{
					name: "in_color",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 3,
				}
			],
			uniforms: [
				{
					name: "u_viewProjection",
					type: ShaderUniformType.MAT3
				}
			]
		});
	}


	public clear() {
		this.data = [];
		this.dirty = true;
	}


	public addLine(x0: number, y0: number, x1: number, y1: number, color: number[]): void {
		this.data.push(...[x0, y0]);
		this.data.push(...color);
		this.data.push(...[x1, y1]);
		this.data.push(...color);
		this.dirty = true;
	}

	public addRect(x: number, y: number, width: number, height: number, color: number[]): void {
		this.addLine(x, y, x + width, y, color);
		this.addLine(x + width, y, x + width, y + height, color);
		this.addLine(x + width, y + height, x, y + height, color);
		this.addLine(x, y + height, x, y, color);
	}

	public addCircle(cx: number, cy: number, radius: number, segments: number, color: number[]): void {

		function getVertex(index: number): [number, number] {
			const theta = 2 * Math.PI * index / segments;
			return [
				radius * Math.cos(theta),
				radius * Math.sin(theta)
			];
		}

		for (let i = 0; i < segments; i++) {
			const v0 = getVertex(i);
			const v1 = getVertex(i + 1);
			this.addLine(v0[0]+cx, v0[1]+cy, v1[0]+cx, v1[1]+cy, color);
		}
	}


	public draw(gl: WebGL2RenderingContext, viewMatrix: Float32Array): void {

		if (this.dirty) {
			if(this.bufferData) {
				this.bufferData.dispose();
			}
			this.bufferData = new GLBuffer(gl, GLBufferType.ARRAY_BUFFER, GLBufferUsage.STATIC_DRAW, "debug.data").setData(this.data);
		}

		// draw
		this.shader.use({
			attributeBuffers: {
				"in_position": this.bufferData!!,
				"in_color": this.bufferData!!
			},
			uniformValues: {
				"u_viewProjection": viewMatrix
			}
		});

		gl.drawArrays(
			gl.LINES,
			0,
			this.data.length / 5
		);

	}


	public dispose() {
		this.shader.dispose();
		this.bufferData?.dispose()
	}

}