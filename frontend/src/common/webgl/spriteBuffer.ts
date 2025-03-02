import {TextureAtlasEntry} from "./textureAtlas";
import {MixedArrayBuffer, MixedArrayBufferType} from "./mixedArrayBuffer";

export class SpriteBuffer {

	private vertexCount: number = 0;
	private vertexData: number[] = [];

	public clear() {
		this.vertexCount = 0;
		this.vertexData = [];
	}


	/**
	 * Add a new sprite to the buffer at the given x,y,z position. All vertices have the same z, meaning the sprite is a flat plane facing the camera.
	 * Uses entry.z as a single number.
	 */
	public addBillboardSprite(entry: SpriteBuffer.Entry) {
		const atlasEntry = entry.atlasEntry;

		const vertexData: number[] = [];
		for (let i = 0, n = atlasEntry.vertices.length; i < n; i++) {

			const vertexCoords = atlasEntry.vertices[i];
			vertexData.push(entry.x + vertexCoords[0] * entry.scaleX);
			vertexData.push(entry.y + vertexCoords[1] * entry.scaleY);
			vertexData.push(entry.z as number);

			const textureCoords = atlasEntry.textureCoordinates[i];
			vertexData.push(textureCoords[0]);
			vertexData.push(textureCoords[1]);
		}

		this.addRaw(vertexData);
	}

	/**
	 * Add a new sprite to the buffer at given x,y,z position. The sprite is a flat plane perpendicular to the ground.
	 * Z is interpolated based on (untransformed) vertex y coordinate (y=0 => z[0], y=1 => z[1]).
	 * Uses entry.z as an array of two numbers (minZ, maxZ).
	 */
	public addGroundSprite(entry: SpriteBuffer.Entry) {
		const atlasEntry = entry.atlasEntry;
		const [minZ, maxZ] = (entry.z as [number, number]);

		const vertexData: number[] = [];
		for (let i = 0, n = atlasEntry.vertices.length; i < n; i++) {

			const vertexCoords = atlasEntry.vertices[i];
			vertexData.push(entry.x + vertexCoords[0] * entry.scaleX);
			vertexData.push(entry.y + vertexCoords[1] * entry.scaleY);
			vertexData.push(minZ + (maxZ-minZ) * vertexCoords[1]);

			const textureCoords = atlasEntry.textureCoordinates[i];
			vertexData.push(textureCoords[0]);
			vertexData.push(textureCoords[1]);
		}

		this.addRaw(vertexData);
	}

	public addRaw(vertexData: number[]) {
		if (vertexData.length % SpriteBuffer.BUFFER_LAYOUT_PATTERN.length !== 0) {
			throw new Error("Invalid vertex data amount. Expected multiple of " + SpriteBuffer.BUFFER_LAYOUT_PATTERN.length + ". Got " + vertexData.length);
		}
		this.vertexCount += Math.floor(vertexData.length / SpriteBuffer.BUFFER_LAYOUT_PATTERN.length);
		this.vertexData.push(...vertexData);
	}

	public getVertexCount(): number {
		return this.vertexCount;
	}

	public buildRawBuffer(): ArrayBuffer {
		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(this.vertexCount, SpriteBuffer.BUFFER_LAYOUT_PATTERN);
		cursor.append(this.vertexData); // todo: optimize bulk "copy"/set ?
		return arrayBuffer.getRawBuffer();
	}

}


export namespace SpriteBuffer {

	export interface Entry {
		atlasEntry: TextureAtlasEntry,
		x: number,
		y: number,
		z: number | [number, number],
		scaleX: number,
		scaleY: number,
	}

	export const BUFFER_LAYOUT_PATTERN = [
		// vertex position (x,y,z)
		...MixedArrayBufferType.VEC3,
		// texture coords (u,v)
		...MixedArrayBufferType.VEC2,
	];

}