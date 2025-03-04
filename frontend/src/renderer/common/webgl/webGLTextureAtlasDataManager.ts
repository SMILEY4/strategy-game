import {TextureAtlasEntry, TextureAtlasGroupDefinition} from "../../../common/webgl/textureAtlas";

export class WebGLTextureAtlasDataManager {

	private readonly textureAtlases = new Map<string, [TextureAtlasEntry[], TextureAtlasGroupDefinition[]]>();

	public register(atlasPath: string, data: string | TextureAtlasEntry[], groupDefinitions: TextureAtlasGroupDefinition[]) {
		if (typeof data === "string") {
			this.setData(atlasPath, JSON.parse(data), groupDefinitions);
		} else {
			this.setData(atlasPath, data, groupDefinitions);
		}
	}

	private setData(atlasPath: string, entries: TextureAtlasEntry[], groupDefinitions: TextureAtlasGroupDefinition[]) {
		const atlasEntries: TextureAtlasEntry[] = entries.map(entry => {
			return {
				...entry,
				// fix uv axis (0,0 = top left)
				textureCoordinates: entry.textureCoordinates.map(uv => {
					return [
						uv[0],
						1 - uv[1]
					]
				}),
				// flip y after fixed uv axis
				vertices: entry.vertices.map(vertex => {
					return [
						vertex[0],
						1-vertex[1],
					]
				}),
			}
		});
		this.textureAtlases.set(atlasPath, [atlasEntries, groupDefinitions]);
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