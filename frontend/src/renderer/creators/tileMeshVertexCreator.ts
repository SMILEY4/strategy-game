import {VertexGeneratorResult} from "../../common/rendergraph/nodes/vertexGeneratorRenderGraphNode";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../common/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../common/tilemapUtils";
import {buildMap} from "../../common/utils";

export namespace TileMeshVertexCreator {

	export const OUTPUT_ID = "tiles.mesh";

	const MESH_VERTEX_COUNT = 6 * 3;

	const MESH_PATTERN = [
		// vertex position
		...MixedArrayBufferType.VEC2,
		// texture coords
		...MixedArrayBufferType.VEC2,
		// corner data
		...MixedArrayBufferType.VEC3,
		// direction data
		MixedArrayBufferType.INT,
	];

	export function func(): Map<string, VertexGeneratorResult> {
		const [vertexCount, vertexData] = buildBaseMesh();
		return buildMap([
			[
				OUTPUT_ID,
				{
					data: vertexData.getRawBuffer(),
					entryCount: vertexCount,
				},
			],
		]);
	}

	function buildBaseMesh(): [number, MixedArrayBuffer] {
		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(MESH_VERTEX_COUNT, MESH_PATTERN);
		appendBaseMeshTriangle(cursor, 0, 1);
		appendBaseMeshTriangle(cursor, 1, 2);
		appendBaseMeshTriangle(cursor, 2, 3);
		appendBaseMeshTriangle(cursor, 3, 4);
		appendBaseMeshTriangle(cursor, 4, 5);
		appendBaseMeshTriangle(cursor, 5, 0);
		return [MESH_VERTEX_COUNT, arrayBuffer];
	}

	function appendBaseMeshTriangle(cursor: MixedArrayBufferCursor, cornerIndexA: number, cornerIndexB: number) {
		const scale = 1.44;
		// center
		cursor.append(0);
		cursor.append(0);
		cursor.append(hexTextureCoordinates(-1));
		cursor.append([1, 0, 0]);
		cursor.append(cornerIndexA);
		// corner a
		cursor.append(hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
		cursor.append(hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
		cursor.append(hexTextureCoordinates(cornerIndexA));
		cursor.append([0, 1, 0]);
		cursor.append(cornerIndexA);
		// corner b
		cursor.append(hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
		cursor.append(hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
		cursor.append(hexTextureCoordinates(cornerIndexB));
		cursor.append([0, 0, 1]);
		cursor.append(cornerIndexA);
	}

	function hexCornerPointX(cornerIndex: number, size: [number, number], scale: number): number {
		const angleDeg = 60 * cornerIndex - 30;
		const angleRad = Math.PI / 180 * angleDeg;
		return size[0] * Math.cos(angleRad) * scale;
	}

	function hexCornerPointY(cornerIndex: number, size: [number, number], scale: number): number {
		const angleDeg = 60 * cornerIndex - 30;
		const angleRad = Math.PI / 180 * angleDeg;
		return size[1] * Math.sin(angleRad) * scale;
	}

	function hexTextureCoordinates(cornerIndex: number): [number, number] {
		const xLeft = 0.065;
		const xCenter = 0.5;
		const xRight = 0.935;
		const yBottom = 0;
		const yCenterBottom = 0.25;
		const yCenter = 0.5;
		const yCenterTop = 0.75;
		const yTop = 1;
		switch (cornerIndex) {
			case -1:
				return [xCenter, yCenter];
			case 0:
				return [xRight, yCenterBottom];
			case 1:
				return [xRight, yCenterTop];
			case 2:
				return [xCenter, yTop];
			case 3:
				return [xLeft, yCenterTop];
			case 4:
				return [xLeft, yCenterBottom];
			case 5:
				return [xCenter, yBottom];
			default:
				return [0, 0];
		}
	}

}