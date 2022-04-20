import ShaderProgram, {ShaderAttributeType, ShaderUniformType} from "./utils/shaderProgram";
import SRC_SHADER_VERTEX from "./shader.vsh?raw";
import SRC_SHADER_FRAGMENT from "./shader.fsh?raw";
import {GameState} from "../gameState";


export class Renderer {

	private gl: WebGL2RenderingContext = null as any;
	private shader: ShaderProgram = null as any;


	public initialize(canvas: HTMLCanvasElement) {

		// get webgl-context
		const gl = canvas.getContext("webgl2");
		if (!gl) {
			throw Error("webgl not supported");
		}
		this.gl = gl;

		// create shader
		this.shader = new ShaderProgram({
			debugName: "tilemap",
			sourceVertex: SRC_SHADER_VERTEX,
			sourceFragment: SRC_SHADER_FRAGMENT,
			attributes: [
				{
					name: "in_position",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 2
				},
				{
					name: "in_tiledata",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 1
				}
			],
			uniforms: [
				{
					name: "u_viewProjection",
					type: ShaderUniformType.MAT3
				}
			]
		}).create(gl);
	}


	public dispose() {
		const gl = this.gl;
		this.shader.dispose(gl);
	}


	public render(state: GameState) {
		const gl = this.gl;

		gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		const viewProjectionMatrix = state.camera.calculateViewProjectionMatrix(this.gl.canvas.width, this.gl.canvas.height);

		state.tilemap.forEach(chunk => {
			this.shader.use(gl, {
				attributeBuffers: {
					"in_position": chunk.bufferPositions,
					"in_tiledata": chunk.bufferTileData
				},
				uniformValues: {
					"u_viewProjection": viewProjectionMatrix
				}
			});
			chunk.bufferIndices.use(gl);
			gl.drawElements(
				gl.TRIANGLES,
				chunk.bufferIndices.getSize(),
				gl.UNSIGNED_SHORT,
				0
			);
		});

	}


	public getGL(): WebGL2RenderingContext {
		return this.gl;
	}


}