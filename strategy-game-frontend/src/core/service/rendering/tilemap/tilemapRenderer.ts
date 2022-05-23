import {Tile} from "../../../../ports/models/tile";
import {GameCanvasHandle} from "../../gameCanvasHandle";
import {BatchRenderer} from "../utils/batchRenderer";
import {Camera} from "../utils/camera";
import SRC_SHADER_VERTEX from "./mapShader.vsh?raw";
import SRC_SHADER_FRAGMENT from "./mapShader.fsh?raw";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../utils/shaderProgram";
import {TilemapUtils} from "../../tilemap/tilemapUtils";


export class TilemapRenderer {

	private readonly gameCanvas: GameCanvasHandle;
	private batchRenderer: BatchRenderer = null as any;
	private shader: ShaderProgram = null as any;


	constructor(gameCanvas: GameCanvasHandle) {
		this.gameCanvas = gameCanvas;
	}

	public initialize() {
		this.batchRenderer = new BatchRenderer(this.gameCanvas.getGL());
		this.shader = new ShaderProgram(this.gameCanvas.getGL(), {
			debugName: "tilemap",
			sourceVertex: SRC_SHADER_VERTEX,
			sourceFragment: SRC_SHADER_FRAGMENT,
			attributes: [
				{
					name: "in_position",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 2,
					offset: 0,
					stride: 5
				},
				{
					name: "in_tiledata",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 3,
					offset: 2,
					stride: 5
				}
			],
			uniforms: [
				{
					name: BatchRenderer.UNIFORM_VIEW_PROJECTION_MATRIX,
					type: ShaderUniformType.MAT3
				},
				{
					name: "u_tileMouseOver",
					type: ShaderUniformType.VEC2
				}
			]
		});
	}

	public render(camera: Camera, map: Tile[], tileMouseOver: [number, number]) {
		this.batchRenderer.begin(camera);
		map.forEach(tile => {
			const vertices = TilemapRenderer.buildVertexData(tile);
			const indices = TilemapRenderer.buildIndexData();
			this.batchRenderer.add(vertices, indices);
		});
		this.batchRenderer.end(this.shader, {
			attributes: ["in_position", "in_tiledata"],
			uniforms: {
				"u_tileMouseOver": tileMouseOver
			}
		});
	}

	public dispose() {
		this.batchRenderer.dispose();
		this.shader.dispose();
	}


	/**
	 * FORMAT: [x, y, q, r, tileId]
	 */
	private static buildVertexData(tile: Tile): number[][] {
		const vertices: number[][] = [];
		const centerPos = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r);
		vertices.push([centerPos[0], centerPos[1], tile.q, tile.r, tile.tileId]);
		for (let i = 0; i < 6; i++) {
			const vertex: number[] = [
				...TilemapRenderer.hexCornerPoint(i, TilemapUtils.DEFAULT_HEX_LAYOUT.size, centerPos[0], centerPos[1]),
				tile.q, tile.r, tile.tileId
			];
			vertices.push(vertex);
			vertices.push(vertex);
		}
		return vertices;
	}

	private static readonly HEX_INDEX_DATA = [
		0, 2, 3,
		0, 4, 5,
		0, 6, 7,
		0, 8, 9,
		0, 10, 11,
		0, 12, 1
	];

	private static buildIndexData(): number[] {
		return TilemapRenderer.HEX_INDEX_DATA;
	}

	private static hexCornerPoint(i: number, size: [number, number], offX: number, offY: number) {
		const angleDeg = 60 * i - 30;
		const angleRad = Math.PI / 180 * angleDeg;
		return [
			size[0] * Math.cos(angleRad) + offX,
			size[1] * Math.sin(angleRad) + offY
		];
	}


}