import {WebGLTextureAtlasDataManager} from "../common/webgl/webGLTextureAtlasDataManager";
import ATLAS_DATA_TILESET from "./textureatlas/tileset.json?raw";


export class GameTextureAtlasDataManager extends WebGLTextureAtlasDataManager {


	constructor() {
		super();
		this.register("/icons/full_color.png", ATLAS_DATA_TILESET)
	}

}