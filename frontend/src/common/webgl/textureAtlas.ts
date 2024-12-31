import {GLDisposable} from "./glDisposable";
import {GLTexture, GLTextureMagFilter, GLTextureMinFilter, GLTextureWrap} from "./glTexture";

export class TextureAtlas implements GLDisposable {

	private readonly texture: GLTexture;
	private readonly data: Map<string, TextureAtlasEntry>;

	constructor(texture: GLTexture, data: Map<string, TextureAtlasEntry>) {
		this.texture = texture;
		this.data = data;
	}

	public bind(textureUnit: number) {
		this.texture.bind(textureUnit);
	}


	public dispose() {
		this.texture.dispose();
	}

	public getEntry(name: string): TextureAtlasEntry {
		const entry = this.data.get(name);
		if (entry) {
			return entry;
		} else {
			throw new Error("Could not find texture atlas entry for name '" + name + "'");
		}
	}

	public getEntryOrNull(name: string): TextureAtlasEntry | null {
		const entry = this.data.get(name);
		return entry ? entry : null;
	}

	public setData(data: Map<string, TextureAtlasEntry>) {
		this.data.clear();
		data.forEach((value, key) => this.data.set(key, value));
	}

}


export interface TextureAtlasEntry {
	name: string,
	origin: [number, number],
	vertices: ([number, number])[],
	textureCoordinates: ([number, number])[],
}

export namespace TextureAtlas {

	/**
	 * @param gl the webgl context
	 * @param texturePath the absolute path to the image file
	 * @param entries the atlas data
	 */
	export function createFromData(gl: WebGL2RenderingContext, texturePath: string, entries: TextureAtlasEntry[]) {

		const texture = GLTexture.createFromPath(gl, texturePath, {
			wrap: GLTextureWrap.CLAMP_TO_EDGE,
			filterMin: GLTextureMinFilter.NEAREST_MIPMAP_LINEAR,
			filterMag: GLTextureMagFilter.LINEAR,
		});

		const data = new Map<string, TextureAtlasEntry>();
		entries.forEach(entry => data.set(entry.name, entry));

		return new TextureAtlas(texture, data);
	}


	/**
	 * @param gl the webgl context
	 * @param path the path to the texture atlas files. E.g. "/texture/myatlas.png" expects two files "/texture/myatlas.png" and "/texture/myatlas.png.json"
	 */
	export function createFromPath(gl: WebGL2RenderingContext, path: string) {
		const atlas = TextureAtlas.createFromData(gl, path, []);
		fetch(path + ".json")
			.then(response => response.json())
			.then(json => json as TextureAtlasEntry[])
			.then(entries => {
				const data = new Map<string, TextureAtlasEntry>();
				entries.forEach(entry => data.set(entry.name, entry));
				atlas.setData(data);
				console.log("loaded data for texture atlas", path);
			})
			.catch(e => {
				console.error("Error loading texture atlas data", e);
			});
		return atlas;
	}

}