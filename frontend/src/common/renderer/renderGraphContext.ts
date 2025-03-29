
export class RenderGraphContext {

	protected readonly data = new Map<string, any>;

	public get<T>(key: string): T {
		if (this.data.has(key)) {
			return this.data.get(key) as T;
		} else {
			throw new Error("No render context entry with key '" + key + "'");
		}
	}

}


export class MutableRenderGraphContext extends RenderGraphContext {

	public set(key: string, value: any) {
		this.data.set(key, value);
	}

}


export namespace RenderGraphContext {

	export const KEY_GL_CONTEXT = "gl"
	export const KEY_CAMERA = "camera"

}
