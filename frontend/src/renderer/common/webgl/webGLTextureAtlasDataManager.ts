import {TextureAtlasEntry} from "../../../common/webgl/textureAtlas";

export class WebGLTextureAtlasDataManager {

	private readonly data = new Map<string, TextureAtlasEntry[]>();

	public register(atlasPath: string, dataJson: string) {
		this.data.set(atlasPath, JSON.parse(dataJson));
	}

	public getData(atlasPath: string): TextureAtlasEntry[] {
		const entries = this.data.get(atlasPath);
		if(entries) {
			return entries
		} else {
			throw new Error("Could not find texture atlas entries for path '" + atlasPath + "'.")
		}
	}

}