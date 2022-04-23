import ShaderProgram, {ShaderAttributeType, ShaderUniformType} from "./utils/shaderProgram";
import SRC_MAP_SHADER_VERTEX from "./mapShader.vsh?raw";
import SRC_MAP_SHADER_FRAGMENT from "./mapShader.fsh?raw";
import SRC_MARKER_SHADER_VERTEX from "./markerShader.vsh?raw";
import SRC_MARKER_SHADER_FRAGMENT from "./markerShader.fsh?raw";
import {GameState} from "../gameState";


export class Renderer {

	private gl: WebGL2RenderingContext = null as any;
	private shaderMap: ShaderProgram = null as any;
	private shaderMarkers: ShaderProgram = null as any;


	public initialize(canvas: HTMLCanvasElement) {

		// get webgl-context
		const gl = canvas.getContext("webgl2");
		if (!gl) {
			throw Error("webgl not supported");
		}
		this.gl = gl;

		// create shader
		this.shaderMap = new ShaderProgram({
			debugName: "tilemap",
			sourceVertex: SRC_MAP_SHADER_VERTEX,
			sourceFragment: SRC_MAP_SHADER_FRAGMENT,
			attributes: [
				{
					name: "in_position",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 2,
				},
				{
					name: "in_tiledata",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 3,
				}
			],
			uniforms: [
				{
					name: "u_viewProjection",
					type: ShaderUniformType.MAT3
				},
				{
					name: "u_tileMouseOver",
					type: ShaderUniformType.VEC2
				}
			]
		}).create(gl);

		this.shaderMarkers = new ShaderProgram({
			debugName: "markers",
			sourceVertex: SRC_MARKER_SHADER_VERTEX,
			sourceFragment: SRC_MARKER_SHADER_FRAGMENT,
			attributes: [
				{
					name: "in_position",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 2
				},
				{
					name: "in_markerdata",
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
		this.shaderMap.dispose(gl);
		this.shaderMarkers.dispose(gl);
	}


	public render(state: GameState) {
		const gl = this.gl;

		gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		const viewProjectionMatrix = state.camera.getViewProjectionMatrixOrThrow();

		// render map
		state.tilemap.forEach(chunk => {
			this.shaderMap.use(gl, {
				attributeBuffers: {
					"in_position": chunk.bufferPositions,
					"in_tiledata": chunk.bufferTileData
				},
				uniformValues: {
					"u_viewProjection": viewProjectionMatrix,
					"u_tileMouseOver": state.tileMouseOver
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

		// render markers
		if (state.markers) {
			this.shaderMarkers.use(gl, {
				attributeBuffers: {
					"in_position": state.markers.bufferPositions,
					"in_markerdata": state.markers.bufferMarkerData
				},
				uniformValues: {
					"u_viewProjection": viewProjectionMatrix
				}
			});
			state.markers.bufferIndices.use(gl);
			gl.drawElements(
				gl.TRIANGLES,
				state.markers.bufferIndices.getSize(),
				gl.UNSIGNED_SHORT,
				0
			);
		}

	}


	public getGL(): WebGL2RenderingContext {
		return this.gl;
	}


}