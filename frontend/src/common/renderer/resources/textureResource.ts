import {RenderGraphResource} from "./renderGraphResource";
import {GLProgram} from "../../webgl/glProgram";
import {GLTexture} from "../../webgl/glTexture";

export class TextureResource extends RenderGraphResource {

	readonly texture: GLTexture

	constructor(key: string, texture: GLTexture) {
		super(key);
		this.texture = texture;
	}

}