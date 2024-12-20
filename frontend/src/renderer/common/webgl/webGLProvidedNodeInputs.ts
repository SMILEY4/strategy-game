import {TextureAtlasEntry} from "../../../common/webgl/textureAtlas";
import {NodeInput} from "../graph/nodeInput";
import {WebGLResourceManager} from "./webGLResourceManager";
import {ProvidedNodeInputs} from "../graph/providedNodeInputs";

export class WebGlProvidedNodeInputs implements ProvidedNodeInputs {

	private readonly textureAtlasEntries: Map<string, TextureAtlasEntry> = new Map();


	constructor(inputs: (NodeInput.VertexBuffer | NodeInput.TextureAtlasData)[], resourceManager: WebGLResourceManager) {
		inputs.forEach(input => {
			if(input instanceof NodeInput.TextureAtlasData) {
				const textureAtlas = resourceManager.getTextureAtlas(input.path).textureAtlas
				textureAtlas.getEntries().forEach(entry => {
					this.textureAtlasEntries.set(input.path + "/" + entry.name, entry)
				})
			}
		})
	}


	public getTextureAtlasEntry(atlasPath: string, entryName: string): TextureAtlasEntry {
		const entry = this.textureAtlasEntries.get(atlasPath + "/" + entryName);
		if(entry) {
			return entry
		} else {
			throw new Error("Could not find texture atlas entry with path '" + atlasPath + "' and name '" + entryName + "'");
		}
	}

}