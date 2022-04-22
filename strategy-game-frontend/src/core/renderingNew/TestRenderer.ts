import {GameState} from "../gameState";
import {BatchRenderer} from "./engine/BatchRenderer";
import ShaderProgram, {ShaderAttributeType, ShaderUniformType} from "../rendering/utils/shaderProgram";
import SRC_SHADER_VERTEX from "./testShader.vsh?raw";
import SRC_SHADER_FRAGMENT from "./testShader.fsh?raw";

export class TestRenderer {

	randomValues: number[] = [...Array(1000000)].map(e => Math.random())


	private gl: WebGL2RenderingContext = null as any;
	private shader: ShaderProgram = null as any;
	private batch: BatchRenderer = null as any;


	public initialize(canvas: HTMLCanvasElement) {
		console.log(this.randomValues)

		const gl = canvas.getContext("webgl2");
		if (!gl) {
			throw Error("webgl not supported");
		}
		this.gl = gl;

		this.batch = new BatchRenderer(gl)

		this.shader = new ShaderProgram({
			debugName: "test",
			sourceVertex: SRC_SHADER_VERTEX,
			sourceFragment: SRC_SHADER_FRAGMENT,
			attributes: [
				{
					name: "in_position",
					type: ShaderAttributeType.FLOAT,
					amountComponents: 2
				}
			],
			uniforms: [
				{
					name: "u_viewProjection",
					type: ShaderUniformType.MAT3
				}
			]
		}).create(gl);

	}

	public render(state: GameState) {
		const gl = this.gl;

		gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);


		this.batch.begin(state.camera);
		for (let i = 0; i < 1000; i++) {
			const x = (this.randomValues[i*2+0] * 2 - 1) * 200;
			const y = (this.randomValues[i*2+1] * 2 - 1) * 200;
			this.batch.add(
				[
					[x - 10, y - 10],
					[x + 10, y - 10],
					[x + 10, y + 10],
					[x - 10, y + 10]
				],
				[
					0, 1, 2,
					0, 2, 3
				]
			);
		}
		this.batch.end(this.shader);

	}


	public dispose() {
		this.batch.dispose()
	}


	public getGL(): WebGL2RenderingContext {
		return this.gl;
	}

}