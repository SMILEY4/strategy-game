import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {Camera} from "../../common/webgl/camera";
import {GameRenderConfig} from "./gameRenderConfig";
import {GameRenderGraph} from "./gameRenderGraph";
import {GameStateAccess} from "../../state/gameStateAccess";
import {ChangeProvider} from "../common/graph/changeProvider";
import {WebGLMonitor} from "../../common/webgl/monitor/webGLMonitor";
import {RenderGraphMonitor} from "../common/graph/renderGraphMonitor";

/**
 * Renderer
 */
export class GameRenderer {

	private readonly changeProvider: ChangeProvider;
	private readonly localStateAccess: GameStateAccess;

	private readonly webglMonitor: WebGLMonitor;
	private readonly renderGraphMonitor: RenderGraphMonitor;

	private renderConfig: GameRenderConfig | null = null;
	private renderGraph: GameRenderGraph | null = null;

	constructor(
		changeProvider: ChangeProvider,
		localStateAccess: GameStateAccess,
		webglMonitor: WebGLMonitor,
		renderGraphMonitor: RenderGraphMonitor,
	) {
		this.changeProvider = changeProvider;
		this.localStateAccess = localStateAccess;
		this.webglMonitor = webglMonitor;
		this.renderGraphMonitor = renderGraphMonitor;
	}

	/**
	 * Initialize the renderer for the given canvas
	 */
	public initialize(canvasHandle: CanvasHandle): void {
		this.webglMonitor.attach(canvasHandle.getGL());
		GameRenderConfig.initialize();
		this.renderGraph = new GameRenderGraph(
			this.changeProvider,
			canvasHandle.getGL(),
			this.renderGraphMonitor,
			this.localStateAccess,
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

		this.renderGraphMonitor.beginFrame();
		this.webglMonitor.beginFrame();

		this.renderConfig = GameRenderConfig.load();
		const camera = this.getRenderCamera(canvasHandle);
		this.renderGraph?.execute(camera, this.renderConfig!);
		this.checkWebGLErrors(canvasHandle.getGL());

		this.webglMonitor.endFrame();
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