import {VertexBufferResource, VertexDataResource, VertexRenderNode} from "../../common/graph/vertexRenderNode";
import {GLAttributeType} from "../../../common/webgl/glTypes";
import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "../../../common/webgl/mixedArrayBuffer";
import {TilemapUtils} from "../../../common/tilemapUtils";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {buildMap, emptyMap} from "../../../common/utils";
import VertexBuffer = NodeOutput.VertexBuffer;

export class TilesBaseVertexNode extends VertexRenderNode {

	public static readonly ID = "vertexnode.tiles.base";

	public static readonly MESH_VERTEX_COUNT = 6 * 3;

	private static readonly MESH_PATTERN = [
		// vertex position
		...MixedArrayBufferType.VEC2,
		// texture coords
		...MixedArrayBufferType.VEC2,
		// corner data
		...MixedArrayBufferType.VEC3,
		// direction data
		MixedArrayBufferType.INT,
	];


	constructor() {
		super({
			id: TilesBaseVertexNode.ID,
			changeKey: TilesBaseVertexNode.ID,
			input: [],
			output: [
				new VertexBuffer({
					name: "vertexbuffer.mesh.tile",
					attributes: [
						{
							name: "in_vertexPosition",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
						},
						{
							name: "in_textureCoordinates",
							type: GLAttributeType.FLOAT,
							amountComponents: 2,
						},
						{
							name: "in_cornerData",
							type: GLAttributeType.FLOAT,
							amountComponents: 3,
						},
						{
							name: "in_directionData",
							type: GLAttributeType.INT,
							amountComponents: 1,
						},
					],
				}),
			],
		});
	}


	public execute(): VertexDataResource {
		const [_, baseMeshData] = this.buildBaseMesh();
		return new VertexDataResource({
			buffers: buildMap({
				"vertexbuffer.mesh.tile": new VertexBufferResource(baseMeshData),
			}),
			outputs: emptyMap(),
		});
	}

	private buildBaseMesh(): [number, ArrayBuffer] {
		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(TilesBaseVertexNode.MESH_VERTEX_COUNT, TilesBaseVertexNode.MESH_PATTERN);
		this.appendBaseMeshTriangle(cursor, 0, 1);
		this.appendBaseMeshTriangle(cursor, 1, 2);
		this.appendBaseMeshTriangle(cursor, 2, 3);
		this.appendBaseMeshTriangle(cursor, 3, 4);
		this.appendBaseMeshTriangle(cursor, 4, 5);
		this.appendBaseMeshTriangle(cursor, 5, 0);
		return [TilesBaseVertexNode.MESH_VERTEX_COUNT, arrayBuffer.getRawBuffer()];
	}

	private appendBaseMeshTriangle(cursor: MixedArrayBufferCursor, cornerIndexA: number, cornerIndexB: number) {
		const scale = 1.44;
		// center
		cursor.append(0);
		cursor.append(0);
		cursor.append(this.hexTextureCoordinates(-1));
		cursor.append([1, 0, 0]);
		cursor.append(cornerIndexA);
		// corner a
		cursor.append(this.hexCornerPointX(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
		cursor.append(this.hexCornerPointY(cornerIndexA, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
		cursor.append(this.hexTextureCoordinates(cornerIndexA));
		cursor.append([0, 1, 0]);
		cursor.append(cornerIndexA);
		// corner b
		cursor.append(this.hexCornerPointX(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
		cursor.append(this.hexCornerPointY(cornerIndexB, TilemapUtils.DEFAULT_HEX_LAYOUT.size, scale));
		cursor.append(this.hexTextureCoordinates(cornerIndexB));
		cursor.append([0, 0, 1]);
		cursor.append(cornerIndexA);
	}

	private hexCornerPointX(cornerIndex: number, size: [number, number], scale: number): number {
		const angleDeg = 60 * cornerIndex - 30;
		const angleRad = Math.PI / 180 * angleDeg;
		return size[0] * Math.cos(angleRad) * scale;
	}

	private hexCornerPointY(cornerIndex: number, size: [number, number], scale: number): number {
		const angleDeg = 60 * cornerIndex - 30;
		const angleRad = Math.PI / 180 * angleDeg;
		return size[1] * Math.sin(angleRad) * scale;
	}

	private hexTextureCoordinates(cornerIndex: number): [number, number] {
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