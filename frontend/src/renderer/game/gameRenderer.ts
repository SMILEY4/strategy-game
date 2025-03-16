import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {Camera} from "../../common/webgl/camera";
import {GameRenderConfig} from "./gameRenderConfig";
import {GameRenderGraph} from "./gameRenderGraph";
import {GameStateAccess} from "../../state/gameStateAccess";
import {ChangeProvider} from "../common/graph/changeProvider";

/**
 * Renderer
 */
export class GameRenderer {

	private readonly changeProvider: ChangeProvider;
	private readonly localStateAccess: GameStateAccess;

	private renderConfig: GameRenderConfig | null = null;
	private renderGraph: GameRenderGraph | null = null;

	constructor(
		changeProvider: ChangeProvider,
		localStateAccess: GameStateAccess,
	) {
		this.changeProvider = changeProvider;
		this.localStateAccess = localStateAccess;
	}

	/**
	 * Initialize the renderer for the given canvas
	 */
	public initialize(canvasHandle: CanvasHandle): void {
		GameRenderConfig.initialize();
		this.renderGraph = new GameRenderGraph(
			this.changeProvider,
			canvasHandle.getGL(),
			this.localStateAccess
		);
		this.renderGraph.initialize(GameRenderConfig.load());
	}

	/**
	 * Render a new frame
	 */
	public render(canvasHandle: CanvasHandle) {
		if (!canvasHandle.isReady()) {
			return;
		}

		this.renderConfig = GameRenderConfig.load();

		const camera = this.getRenderCamera(canvasHandle);
		this.renderGraph?.execute(camera, this.renderConfig!);

		this.checkWebGLErrors(canvasHandle.getGL());
	}

	private checkWebGLErrors(gl: WebGL2RenderingContext) {
		let error = gl.getError();
		while (error !== gl.NO_ERROR) {
			let strError = "" + error;
			if (error === gl.INVALID_ENUM) strError = "INVALID_ENUM";
			if (error === gl.INVALID_VALUE) strError = "INVALID_VALUE";
			if (error === gl.INVALID_OPERATION) strError = "INVALID_OPERATION";
			if (error === gl.INVALID_FRAMEBUFFER_OPERATION) strError = "INVALID_FRAMEBUFFER_OPERATION";
			if (error === gl.OUT_OF_MEMORY) strError = "OUT_OF_MEMORY";
			if (error === gl.CONTEXT_LOST_WEBGL) strError = "CONTEXT_LOST_WEBGL";

			console.error("Unhandled WebGL error", strError);

			error = gl.getError();
		}
	}

	/**
	 * Dispose the renderer and all resources
	 */
	public dispose() {
		this.renderGraph?.dispose();
		this.renderGraph = null;
	}

	private getRenderCamera(canvasHandle: CanvasHandle): Camera {
		const data = this.localStateAccess.getCamera();
		return Camera.create(
			data,
			canvasHandle.getCanvasWidth(),
			canvasHandle.getCanvasHeight(),
			canvasHandle.getClientWidth(),
			canvasHandle.getClientHeight(),
		);
	}

}