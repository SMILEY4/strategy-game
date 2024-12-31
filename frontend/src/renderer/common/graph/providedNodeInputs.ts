import {TextureAtlasEntry} from "../../../common/webgl/textureAtlas";

export interface ProvidedNodeInputs {
	getTextureAtlasEntry(atlasPath: string, entryName: string): TextureAtlasEntry
}