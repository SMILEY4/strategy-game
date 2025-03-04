import {TextureAtlasEntry} from "../../../common/webgl/textureAtlas";

export interface ProvidedNodeInputs {
	getTextureAtlasEntryNames(atlasPath: string): string[]
	getTextureAtlasEntry(atlasPath: string, entryName: string): TextureAtlasEntry
	getTextureAtlasGroup(atlasPath: string, groupName: string): TextureAtlasEntry[]
}