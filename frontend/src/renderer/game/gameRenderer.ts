import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {Camera} from "../../common/webgl/camera";
import {GameRenderConfig} from "./gameRenderConfig";
import {GameRenderGraph} from "./gameRenderGraph";
import {GameStateAccess} from "../../state/gameStateAccess";
import {ChangeProvider} from "../common/graph/changeProvider";
import {WebGLMonitor} from "../../common/webgl/monitor/webGLMonitor";
import {RenderGraphMonitor} from "../common/graph/renderGraphMonitor";
import {GLError} from "../../common/webgl/glError";

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
		GLError.checkRemaining(canvasHandle.getGL())

		this.webglMonitor.endFrame();
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