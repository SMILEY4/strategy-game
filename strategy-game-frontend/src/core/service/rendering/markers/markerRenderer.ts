import {GameCanvas} from "../../gameCanvas";
import {BatchRenderer} from "../utils/BatchRenderer";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import SRC_MARKER_SHADER_VERTEX from "./markerShader.vsh?raw";
import SRC_MARKER_SHADER_FRAGMENT from "./markerShader.fsh?raw";
import {Camera} from "../utils/camera";
import {GlobalState} from "../../../../state/globalState";
import PlayerMarker = GlobalState.PlayerMarker;
import PlaceMarkerCommand = GlobalState.PlaceMarkerCommand;
import {TilemapUtils} from "../../tilemap/tilemapUtils";

export class MarkerRenderer {

	private readonly gameCanvas: GameCanvas;
	private batchRenderer: BatchRenderer = null as any;
	private shader: ShaderProgram = null as any;


	constructor(gameCanvas: GameCanvas) {
		this.gameCanvas = gameCanvas;
	}

	public initialize() {
		this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
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
		this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL());
	}


	public render(camera: Camera, markers: PlayerMarker[], commands: PlaceMarkerCommand[]) {
		this.batchRenderer.begin(camera);
		markers.forEach(m => {
			const [offX, offY] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, m.q, m.r);
			const size = TilemapUtils.DEFAULT_HEX_LAYOUT.size;
			this.batchRenderer.add([
				[offX, offY, m.playerId],
				[offX - (size[0] / 3), offY + size[1], m.playerId],
				[offX + (size[0] / 3), offY + size[1], m.playerId],
			]);
		});
		commands.forEach(m => {
			const [offX, offY] = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, m.q, m.r);
			const size = TilemapUtils.DEFAULT_HEX_LAYOUT.size;
			this.batchRenderer.add([
				[offX, offY, -1],
				[offX - (size[0] / 3), offY + size[1], -1],
				[offX + (size[0] / 3), offY + size[1], -1],
			]);
		});
		this.batchRenderer.end(this.shader, {
			attributes: ["in_position", "in_markerdata"],
			uniforms: {}
		});

	}


	public dispose() {
		this.batchRenderer.dispose();
		this.shader.dispose();
	}

}