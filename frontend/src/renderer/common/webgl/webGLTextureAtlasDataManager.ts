import {TextureAtlasEntry, TextureAtlasGroupDefinition} from "../../../common/webgl/textureAtlas";

export class WebGLTextureAtlasDataManager {

	private readonly textureAtlases = new Map<string, [TextureAtlasEntry[], TextureAtlasGroupDefinition[]]>();

	public register(
		name: string,
		data: string | TextureAtlasEntry[],
		overwrites: TextureAtlasEntryOverwrite[],
		groupDefinitions: TextureAtlasGroupDefinition[],
	) {
		if (typeof data === "string") {
			this.setData(name, JSON.parse(data), overwrites, groupDefinitions);
		} else {
			this.setData(name, data, overwrites, groupDefinitions);
		}
	}

	private setData(
		name: string,
		entries: TextureAtlasEntry[],
		overwrites: TextureAtlasEntryOverwrite[],
		groupDefinitions: TextureAtlasGroupDefinition[],
	) {
		const atlasEntries: TextureAtlasEntry[] = entries.map(entry => {
			const overwrite = overwrites.find(it => it.name === entry.name);
			return {
				...entry,
				textureCoordinates: this.buildTextureCoordinates(entry, overwrite),
				vertices: this.buildVertices(entry, overwrite),
				scale: this.buildScale(entry, overwrite),
			};
		});
		this.textureAtlases.set(name, [atlasEntries, groupDefinitions]);
	}

	private buildTextureCoordinates(entry: TextureAtlasEntry, overwrite: TextureAtlasEntryOverwrite | undefined): ([number, number])[] {
		return entry.textureCoordinates.map(uv => {
			// fix v axis (0,0 = top left)
			return [
				uv[0],
				1 - uv[1],
			];
		});
	}

	private buildVertices(entry: TextureAtlasEntry, overwrite: TextureAtlasEntryOverwrite | undefined): ([number, number])[] {
		return entry.vertices.map(vertex => {
			// flip y after fixed uv axis
			return [
				vertex[0],
				1 - vertex[1],
			];
		});
	}

	private buildScale(entry: TextureAtlasEntry, overwrite: TextureAtlasEntryOverwrite | undefined): number {
		if (overwrite && overwrite.scale) {
			return overwrite.scale;
		} else {
			return entry.scale ? entry.scale : 1;
		}
	}

	public getEntries(atlasPath: string): TextureAtlasEntry[] {
		const data = this.textureAtlases.get(atlasPath);
		if (data) {
			return data[0];
		} else {
			throw new Error("Could not find texture atlas data for path '" + atlasPath + "'.");
		}
	}

	public getGroupDefinitions(atlasPath: string): TextureAtlasGroupDefinition[] {
		const data = this.textureAtlases.get(atlasPath);
		if (data) {
			return data[1];
		} else {
			throw new Error("Could not find texture atlas data for path '" + atlasPath + "'.");
		}
	}

}

export interface TextureAtlasEntryOverwrite {
	name: string,
	scale?: number,
}