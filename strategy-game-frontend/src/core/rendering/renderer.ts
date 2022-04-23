import SRC_MARKER_SHADER_VERTEX from "./markerShader.vsh?raw";
import SRC_MARKER_SHADER_FRAGMENT from "./markerShader.fsh?raw";
import {GlobalState} from "../../state/globalState";
import {Camera} from "./utils/camera";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "./utils/shaderProgram";
import {BatchRenderer} from "./utils/BatchRenderer";
import {TilemapRenderer} from "./tilemap/TilemapRenderer";


export class Renderer {

	private gl: WebGL2RenderingContext = null as any;
	private shaderMarkers: ShaderProgram = null as any;

	private batchRenderer: BatchRenderer = null as any;
	private tilemapRenderer: TilemapRenderer = null as any;

	public initialize(canvas: HTMLCanvasElement) {

		const gl = canvas.getContext("webgl2");
		if (!gl) {
			throw Error("webgl not supported");
		}
		this.gl = gl;

		this.tilemapRenderer = new TilemapRenderer(gl);

		this.shaderMarkers = new ShaderProgram(gl, {
			debugName: "markers",
			sourceVertex: SRC_MARKER_SHADER_VERTEX,
			sourceFragment: SRC_MARKER_SHADER_FRAGMENT,
			attributes: [
				{
					name: "in_position",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 2,
					stride: 3,
					offset: 0,
				},
				{
					name: "in_markerdata",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 1,
					stride: 3,
					offset: 2,
				}
			],
			uniforms: [
				{
					name: "u_viewProjection",
					type: ShaderUniformType.MAT3
				}
			]
		});

		this.batchRenderer = new BatchRenderer(gl);
	}


	public dispose() {
		this.shaderMarkers.dispose();
		this.tilemapRenderer.dispose();
	}


	public render(globalState: GlobalState.State, camera: Camera, tileMouseOver: [number, number]) {
		const gl = this.gl;

		gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);


		// render map
		this.tilemapRenderer.render(camera, globalState.map, tileMouseOver);

		// render markers
		this.batchRenderer.begin(camera);
		globalState.playerMarkers.forEach(m => {
			const [offX, offY] = TilemapRenderer.hexToPixel(TilemapRenderer.DEFAULT_HEX_LAYOUT, m.q, m.r);
			const size = TilemapRenderer.DEFAULT_HEX_LAYOUT.size;
			this.batchRenderer.add([
				[offX, offY, m.playerId],
				[offX - (size[0] / 3), offY + size[1], m.playerId],
				[offX + (size[0] / 3), offY + size[1], m.playerId],
			]);
		});
		globalState.playerCommands.forEach(m => {
			const [offX, offY] = TilemapRenderer.hexToPixel(TilemapRenderer.DEFAULT_HEX_LAYOUT, m.q, m.r);
			const size = TilemapRenderer.DEFAULT_HEX_LAYOUT.size;
			this.batchRenderer.add([
				[offX, offY, -1],
				[offX - (size[0] / 3), offY + size[1], -1],
				[offX + (size[0] / 3), offY + size[1], -1],
			]);
		});
		this.batchRenderer.end(this.shaderMarkers, {
			attributes: ["in_position", "in_markerdata"],
			uniforms: {}
		});

	}


}