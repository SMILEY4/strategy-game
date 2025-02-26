import {TextureAtlasEntry} from "../../../common/webgl/textureAtlas";

export class WebGLTextureAtlasDataManager {

	private readonly data = new Map<string, TextureAtlasEntry[]>();

	public register(atlasPath: string, data: string | TextureAtlasEntry[]) {
		if (typeof data === "string") {
			this.setData(atlasPath, JSON.parse(data));
		} else {
			this.setData(atlasPath, data);
		}
	}

	private setData(atlasPath: string, entries: TextureAtlasEntry[]) {
		this.data.set(atlasPath, entries.map(entry => {
			return {
				...entry,
				textureCoordinates: entry.textureCoordinates.map(uv => {
					return [
						uv[0],
						1 - uv[1]
					]
				}),
				vertices: entry.vertices.map(vertex => {
					return [
						vertex[0],
						1-vertex[1],
					]
				}),
			}
		}));
	}

	public getData(atlasPath: string): TextureAtlasEntry[] {
		const entries = this.data.get(atlasPath);
		if (entries) {
			return entries;
		} else {
			throw new Error("Could not find texture atlas entries for path '" + atlasPath + "'.");
		}
	}

}