import {BatchRenderer} from "../engine/BatchRenderer";
import {Camera} from "../../rendering/utils/camera";
import {GlobalState} from "../../../state/globalState";
import SRC_SHADER_VERTEX from "./mapShader.vsh?raw";
import SRC_SHADER_FRAGMENT from "./mapShader.fsh?raw";
import {ShaderAttributeType, ShaderProgram, ShaderUniformType} from "../engine/shaderProgram";
import Tile = GlobalState.Tile;

class HexOrientation {
	public readonly f0: number;
	public readonly f1: number;
	public readonly f2: number;
	public readonly f3: number;
	public readonly b0: number;
	public readonly b1: number;
	public readonly b2: number;
	public readonly b3: number;
	public readonly startAngle: number;


	constructor(f0: number, f1: number, f2: number, f3: number, b0: number, b1: number, b2: number, b3: number, startAngle: number) {
		this.f0 = f0;
		this.f1 = f1;
		this.f2 = f2;
		this.f3 = f3;
		this.b0 = b0;
		this.b1 = b1;
		this.b2 = b2;
		this.b3 = b3;
		this.startAngle = startAngle;
	}

	public static POINTY_TOP: HexOrientation = new HexOrientation(
		Math.sqrt(3), Math.sqrt(3) / 2, 0, 3 / 2,
		Math.sqrt(3) / 3, -1 / 3, 0, 2 / 3,
		0.5
	);

	public static FLAT_TOP: HexOrientation = new HexOrientation(
		3 / 2, 0, Math.sqrt(3) / 2, Math.sqrt(3),
		2 / 3, 0, -1 / 3, Math.sqrt(3) / 3,
		0
	);

}


export class HexLayout {
	public readonly orientation: HexOrientation;
	public readonly size: [number, number];
	public readonly origin: [number, number];

	constructor(orientation: HexOrientation, size: [number, number], origin: [number, number]) {
		this.orientation = orientation;
		this.size = size;
		this.origin = origin;
	}

	public static build(type: "pointy-top" | "flat-top", size: number | number[], originX: number, originY: number) {
		return new HexLayout(
			type === "pointy-top" ? HexOrientation.POINTY_TOP : HexOrientation.FLAT_TOP,
			[Array.isArray(size) ? size[0] : size, Array.isArray(size) ? size[1] : size],
			[originX, originY]
		);
	}
}


export class TilemapRenderer {

	private static readonly DEFAULT_HEX_LAYOUT = HexLayout.build("pointy-top", [10, 10], 0, 0);

	private readonly batchRenderer: BatchRenderer;
	private readonly shader: ShaderProgram;


	constructor(gl: WebGL2RenderingContext) {
		this.batchRenderer = new BatchRenderer(gl);
		this.shader = new ShaderProgram(gl, {
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

	public render(camera: Camera, map: Tile[]) {
		this.batchRenderer.begin(camera);
		map.forEach(tile => {
			const vertices = TilemapRenderer.buildVertexData(tile);
			const indices = TilemapRenderer.buildIndexData();
			this.batchRenderer.add(vertices, indices);
		});
		this.batchRenderer.end(this.shader, {
			attributes: ["in_position", "in_tiledata"],
			uniforms: {
				"u_tileMouseOver": [0, 0]
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
		const centerPos = this.hexToPixel(TilemapRenderer.DEFAULT_HEX_LAYOUT, tile.q, tile.r);
		vertices.push([centerPos[0], centerPos[1], tile.q, tile.r, tile.tileId]);
		for (let i = 0; i < 6; i++) {
			const vertex: number[] = [
				...TilemapRenderer.hexCornerPoint(i, TilemapRenderer.DEFAULT_HEX_LAYOUT.size, centerPos[0], centerPos[1]),
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

	private static hexToPixel(layout: HexLayout, q: number, r: number): number[] {
		const M = layout.orientation;
		const x = (M.f0 * q + M.f1 * r) * (layout.size[0]);
		const y = (M.f2 * q + M.f3 * r) * (layout.size[1]);
		return [
			x + layout.origin[0],
			y + layout.origin[1]
		];
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