import {TextureAtlasEntry} from "./textureAtlas";
import {MixedArrayBuffer, MixedArrayBufferType} from "./mixedArrayBuffer";
import {Color} from "../color";

export class SpriteBuffer {

	private vertexCount: number = 0;
	private vertexData: number[] = [];

	public clear() {
		this.vertexCount = 0;
		this.vertexData = [];
	}


	/**
	 * Add a new sprite to the buffer at the given x,y,z position. All vertices have the same z, meaning the sprite is a flat plane facing the camera.
	 * Sprite is centered on x and aligned top of y.
	 * Uses entry.z as a single number.
	 */
	public addBillboardSprite(entry: SpriteBuffer.Entry) {
		const atlasEntry = entry.atlasEntry;

		const scaleX = entry.scaleX * atlasEntry.scale
		const scaleY = entry.scaleY * atlasEntry.scale

		for (let i = 0, n = atlasEntry.vertices.length; i < n; i++) {

			const vertexCoords = atlasEntry.vertices[i];
			const x = entry.x + vertexCoords[0] * scaleX - scaleX / 2
			const y = entry.y + vertexCoords[1] * scaleY
			const z = entry.z as number
			const textureCoords = atlasEntry.textureCoordinates[i];

			// vertex position (x,y,z)
			this.vertexData.push(x);
			this.vertexData.push(y);
			this.vertexData.push(z);

			// texture coords (u,v)
			this.vertexData.push(textureCoords[0]);
			this.vertexData.push(textureCoords[1]);

			// tile base color (r,g,b)
			this.vertexData.push(...entry.colorBaseTile);

			// country color (r,g,b)
			this.vertexData.push(...entry.colorCountry);
		}

		this.vertexCount += atlasEntry.vertices.length;
	}

	/**
	 * Add a new sprite to the buffer at given x,y,z position. The sprite is a flat plane perpendicular to the ground.
	 * Sprite is centered on x and aligned top of y.
	 * Z is interpolated based on (untransformed) vertex y coordinate (y=0 => z[0], y=1 => z[1]).
	 * Uses entry.z as an array of two numbers (minZ, maxZ).
	 */
	public addGroundSprite(entry: SpriteBuffer.Entry) {
		const atlasEntry = entry.atlasEntry;
		const [minZ, maxZ] = (entry.z as [number, number]);

		const scaleX = entry.scaleX * atlasEntry.scale
		const scaleY = entry.scaleY * atlasEntry.scale

		for (let i = 0, n = atlasEntry.vertices.length; i < n; i++) {

			const vertexCoords = atlasEntry.vertices[i];
			const x = entry.x + vertexCoords[0] * scaleX - scaleX / 2
			const y = entry.y + vertexCoords[1] * scaleY
			const z = minZ + (maxZ-minZ) * vertexCoords[1]
			const textureCoords = atlasEntry.textureCoordinates[i];

			// vertex position (x,y,z)
			this.vertexData.push(x);
			this.vertexData.push(y);
			this.vertexData.push(z);

			// texture coords (u,v)
			this.vertexData.push(textureCoords[0]);
			this.vertexData.push(textureCoords[1]);

			// tile base color (r,g,b)
			this.vertexData.push(...entry.colorBaseTile);

			// country color (r,g,b)
			this.vertexData.push(...entry.colorCountry);
		}

		this.vertexCount += atlasEntry.vertices.length;
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
		cursor.appendValues(this.vertexData);
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
		colorBaseTile: [number, number, number],
		colorCountry: [number, number, number]
	}

	export const BUFFER_LAYOUT_PATTERN = [
		// vertex position (x,y,z)
		...MixedArrayBufferType.VEC3,
		// texture coords (u,v)
		...MixedArrayBufferType.VEC2,
		// tile base color (r,g,b)
		...MixedArrayBufferType.VEC3,
		// country color (r,g,b)
		...MixedArrayBufferType.VEC3,
	];

}