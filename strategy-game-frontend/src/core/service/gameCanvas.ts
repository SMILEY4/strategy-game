export class GameCanvas {

	private canvas: HTMLCanvasElement | null = null;
	private gl: WebGL2RenderingContext | null = null;


	public getCanvas(): HTMLCanvasElement {
		if (this.canvas) {
			return this.canvas;
		} else {
			throw new Error("Cant get canvas: is null");
		}
	}


	public getGL(): WebGL2RenderingContext {
		if (this.gl) {
			return this.gl;
		} else {
			throw new Error("Cant get webgl-context: is null");
		}
	}


	public set(canvas: HTMLCanvasElement | null): void {
		this.canvas = canvas;
		if (canvas) {
			const gl = canvas.getContext("webgl2");
			if (!gl) {
				throw Error("webgl2 not supported");
			}
			this.gl = gl;
		} else {
			this.gl = null;
		}
	}

}