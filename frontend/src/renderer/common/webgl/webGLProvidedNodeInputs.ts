import {TextureAtlas, TextureAtlasEntry} from "../../../common/webgl/textureAtlas";
import {NodeInput} from "../graph/nodeInput";
import {WebGLResourceManager} from "./webGLResourceManager";
import {ProvidedNodeInputs} from "../graph/providedNodeInputs";

export class WebGlProvidedNodeInputs implements ProvidedNodeInputs {

	private readonly textureAtlasEntries: Map<string, TextureAtlas> = new Map();

	constructor(inputs: (NodeInput.VertexBuffer | NodeInput.TextureAtlasData)[], resourceManager: WebGLResourceManager) {
		inputs.forEach(input => {
			if (input instanceof NodeInput.TextureAtlasData) {
				const textureAtlas = resourceManager.getTextureAtlas(input.path).textureAtlas;
				this.textureAtlasEntries.set(input.path, textureAtlas);
			}
		});
	}

	public getTextureAtlasEntryNames(atlasPath: string): string[] {
		const atlas = this.textureAtlasEntries.get(atlasPath);
		if (atlas) {
			return atlas.getEntryNames();
		} else {
			console.warn("Could not find texture atlas with path '" + atlasPath + "'");
			return [];
		}
	}


	public getTextureAtlasEntry(atlasPath: string, entryName: string): TextureAtlasEntry {
		const entry = this.textureAtlasEntries.get(atlasPath)?.getEntryOrNull(entryName);
		if (entry) {
			return entry;
		} else {
			console.warn("Could not find texture atlas entry with path '" + atlasPath + "' and name '" + entryName + "'. Returning dummy entry.");
			return {
				name: entryName,
				vertices: [],
				textureCoordinates: [],
				offset: 0,
				mode: "billboard",
			};
		}
	}

	public getTextureAtlasGroup(atlasPath: string, groupName: string): TextureAtlasEntry[] {
		const group = this.textureAtlasEntries.get(atlasPath)?.getGroupOrNull(groupName);
		if (group) {
			return group;
		} else {
			console.warn("Could not find texture atlas group with path '" + atlasPath + "' and name '" + groupName + "'. Returning dummy group.");
			return [];
		}
	}

}