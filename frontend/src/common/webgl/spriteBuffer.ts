import {TextureAtlasEntry} from "./textureAtlas";
import {MixedArrayBuffer, MixedArrayBufferType} from "./mixedArrayBuffer";

export class SpriteBuffer {

	private vertexCount: number = 0;
	private vertexData: number[] = [];

	public clear() {
		this.vertexCount = 0;
		this.vertexData = [];
	}

	public add(entry: SpriteBuffer.Entry) {
		const atlasEntry = entry.atlasEntry;
		const origin = atlasEntry.origin;

		const vertexData: number[] = [];
		for (let i = 0, n = atlasEntry.vertices.length; i < n; i++) {
			const vertexCoords = atlasEntry.vertices[i];
			const textureCoords = atlasEntry.textureCoordinates[i];
			vertexData.push(entry.x + (vertexCoords[0] - origin[0]) * entry.scaleX);
			vertexData.push(entry.y + (vertexCoords[1] - origin[1]) * entry.scaleY);
			vertexData.push(entry.y + entry.zOffset);
			vertexData.push(textureCoords[0]);
			vertexData.push(textureCoords[1]);
		}

		this.addRaw(vertexData);
	}

	public addRaw(vertexData: number[]) {
		if(vertexData.length % SpriteBuffer.BUFFER_LAYOUT_PATTERN.length !== 0) {
			throw new Error("Invalid vertex data amount. Expected multiple of " + SpriteBuffer.BUFFER_LAYOUT_PATTERN.length + ". Got " + vertexData.length);
		}
		this.vertexCount += Math.floor(vertexData.length / SpriteBuffer.BUFFER_LAYOUT_PATTERN.length)
		this.vertexData.push(...vertexData)
	}

	public getVertexCount(): number {
		return this.vertexCount;
	}

	public buildRawBuffer(): ArrayBuffer {
		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(this.vertexCount, SpriteBuffer.BUFFER_LAYOUT_PATTERN);
		cursor.append(this.vertexData) // todo: optimize bulk "copy"/set ?
		return arrayBuffer.getRawBuffer();
	}

}


export namespace SpriteBuffer {

	export interface Entry {
		atlasEntry: TextureAtlasEntry,
		x: number,
		y: number,
		scaleX: number,
		scaleY: number,
		zOffset: number,
	}

	export const BUFFER_LAYOUT_PATTERN = [
		// vertex position
		...MixedArrayBufferType.VEC2,
		// sprite y
		MixedArrayBufferType.FLOAT,
		// texture coords
		...MixedArrayBufferType.VEC2,
	];

}