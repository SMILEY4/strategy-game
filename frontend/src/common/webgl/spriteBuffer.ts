import {TextureAtlasEntry} from "./textureAtlas";
import {MixedArrayBuffer, MixedArrayBufferType} from "./mixedArrayBuffer";

export class SpriteBuffer {

	private vertexCount: number = 0;
	private entries: SpriteBuffer.Entry[] = [];

	public clear() {
		this.vertexCount = 0;
		this.entries = [];
	}

	public add(entry: SpriteBuffer.Entry) {
		this.vertexCount += entry.atlasEntry.vertices.length;
		this.entries.push(entry);
	}

	public getVertexCount(): number {
		return this.vertexCount;
	}

	public buildRawBuffer(): ArrayBuffer {

		const [arrayBuffer, cursor] = MixedArrayBuffer.createWithCursor(this.vertexCount, SpriteBuffer.BUFFER_LAYOUT_PATTERN);

		const entries = this.entries;
		for (let i = 0, n = entries.length; i < n; i++) {
			const sprite = entries[i];
			const atlasEntry = sprite.atlasEntry;
			const origin = atlasEntry.origin;

			for (let j = 0, m = atlasEntry.vertices.length; j < m; j++) {
				const vertexCoords = atlasEntry.vertices[j];
				cursor.append(sprite.x + ((vertexCoords[0] - origin[0]) * sprite.scaleX));
				cursor.append(sprite.y + ((vertexCoords[1] - origin[1]) * sprite.scaleY));
				cursor.append(sprite.y + sprite.zOffset);
				cursor.append(atlasEntry.textureCoordinates[j]);
			}

		}

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
		zOffset: number
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