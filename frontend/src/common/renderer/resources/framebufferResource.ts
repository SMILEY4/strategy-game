import {RenderGraphResource} from "./renderGraphResource";
import {GLTexture} from "../../webgl/glTexture";
import {GLFramebuffer} from "../../webgl/glFramebuffer";

export class FramebufferResource extends RenderGraphResource {

	readonly framebuffer: GLFramebuffer;

	constructor(key: string, framebuffer: GLFramebuffer) {
		super(key);
		this.framebuffer = framebuffer;
	}

}