import {GlobalState} from "../../state/globalState";
import {GameState} from "../gameState";
import GLBuffer, {GLBufferType, GLBufferUsage} from "./utils/glBuffer";
import Tile = GlobalState.Tile;
import TilemapChunkRenderData = GameState.TilemapChunkRenderData;


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

interface Chunk {
	i: number,
	j: number,
	tiles: Tile[]
}


export class TilemapRenderDataBuilder {

	private static readonly DEFAULT_CHUNK_SIZE = 20;
	private static readonly DEFAULT_HEX_LAYOUT = HexLayout.build("pointy-top", [10, 10], 0, 0);

	public static build(tiles: Tile[], gl: WebGL2RenderingContext): TilemapChunkRenderData[] {
		if (tiles.length === 0) {
			return [];
		} else {
			const chunks = TilemapRenderDataBuilder.groupIntoChunks(tiles, TilemapRenderDataBuilder.DEFAULT_CHUNK_SIZE);
			const arrayData = TilemapRenderDataBuilder.chunksToArrayData(chunks, TilemapRenderDataBuilder.DEFAULT_HEX_LAYOUT);
			return TilemapRenderDataBuilder.arrayDataToRenderData(arrayData, gl);
		}
	}


	private static groupIntoChunks(tiles: Tile[], chunkSize: number): Chunk[] {

		const chunks: Chunk[] = [];

		function getChunkOrInsert(i: number, j: number): Chunk {
			const existing = chunks.find(c => c.i === j && c.j === j);
			if (existing) {
				return existing;
			} else {
				const newChunk = {
					i: i,
					j: j,
					tiles: []
				};
				chunks.push(newChunk);
				return newChunk;
			}
		}

		function getChunkCoords(q: number, r: number): [number, number] {
			return [
				Math.floor(q / chunkSize),
				Math.floor(r / chunkSize)
			];
		}

		tiles.forEach(tile => {
			const chunkCoords = getChunkCoords(tile.q, tile.r);
			const chunk = getChunkOrInsert(chunkCoords[0], chunkCoords[1]);
			chunk.tiles.push(tile);
		});

		return chunks;
	}


	private static chunksToArrayData(chunks: Chunk[], layout: HexLayout): ({ indices: number[], positions: number[], tileData: number[] })[] {
		return chunks.map(chunk => TilemapRenderDataBuilder.chunkToArrayData(chunk, layout));
	}


	private static chunkToArrayData(chunk: Chunk, layout: HexLayout): { indices: number[], positions: number[], tileData: number[] } {

		const indices: number[] = [];
		const positions: number[] = [];
		const tileData: number[] = [];

		chunk.tiles.forEach((tile, index) => {
			const pixelPos = TilemapRenderDataBuilder.hexToPixel(layout, tile.q, tile.r, 0);
			indices.push(...TilemapRenderDataBuilder.buildHexTileIndices(index));
			positions.push(...TilemapRenderDataBuilder.buildHexTilePositions(layout.size, pixelPos[0], pixelPos[1]));
			tileData.push(...TilemapRenderDataBuilder.buildHexTileData(tile));
		});

		return {
			indices: indices,
			positions: positions,
			tileData: tileData
		};
	}


	private static arrayDataToRenderData(arrayData: ({ indices: number[], positions: number[], tileData: number[] })[], gl: WebGL2RenderingContext): TilemapChunkRenderData[] {
		return arrayData.map(data => {
			return {
				bufferIndices: new GLBuffer({
					debugName: "indices",
					type: GLBufferType.ELEMENT_ARRAY_BUFFER,
					usage: GLBufferUsage.STATIC_DRAW,
					data: data.indices
				}).create(gl),
				bufferPositions: new GLBuffer({
					debugName: "positions",
					type: GLBufferType.ARRAY_BUFFER,
					usage: GLBufferUsage.STATIC_DRAW,
					data: data.positions
				}).create(gl),
				bufferTileData: new GLBuffer({
					debugName: "tileData",
					type: GLBufferType.ARRAY_BUFFER,
					usage: GLBufferUsage.STATIC_DRAW,
					data: data.tileData
				}).create(gl)
			};
		});
	}


	private static hexToPixel(layout: HexLayout, q: number, r: number, padding: number): number[] {
		const M = layout.orientation;
		const x = (M.f0 * q + M.f1 * r) * (layout.size[0] + padding);
		const y = (M.f2 * q + M.f3 * r) * (layout.size[1] + padding);
		return [
			x + layout.origin[0],
			y + layout.origin[1]
		];
	}


	private static buildHexTileIndices(elementOffset: number): number[] {
		const offset = elementOffset * 13;
		return [
			0, 2, 3,
			0, 4, 5,
			0, 6, 7,
			0, 8, 9,
			0, 10, 11,
			0, 12, 1
		].map(i => i + offset);
	}


	private static buildHexTilePositions(size: [number, number], offX: number, offY: number): number[] {

		function hexPoint(i: number, size: [number, number], offX: number, offY: number) {
			const angleDeg = 60 * i - 30;
			const angleRad = Math.PI / 180 * angleDeg;
			return [
				size[0] * Math.cos(angleRad) + offX,
				size[1] * Math.sin(angleRad) + offY
			];
		}

		const vertices: number[] = [];
		vertices.push(offX, offY);
		for (let i = 0; i < 6; i++) {
			vertices.push(...hexPoint(i, size, offX, offY));
			vertices.push(...hexPoint(i, size, offX, offY));
		}
		return vertices;
	}


	private static buildHexTileData(tile: Tile): number[] {
		return [
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId,
			tile.tileId
		];
	}


}