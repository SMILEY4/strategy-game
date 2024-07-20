import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {Camera} from "../../shared/webgl/camera";
import {GameRenderConfig} from "./gameRenderConfig";
import {ChangeProvider} from "./changeProvider";
import {RenderRepository} from "./renderRepository";
import {GameRenderGraph} from "./gameRenderGraph";

/**
 * Renderer
 */
export class GameRenderer {

	private readonly changeProvider;
	private readonly repository: RenderRepository;

	private renderConfig: GameRenderConfig | null = null;
	private renderGraph: GameRenderGraph | null = null;

	constructor(
		renderRepository: RenderRepository,
	) {
		this.repository = renderRepository;
		this.changeProvider = new ChangeProvider(renderRepository);
	}

	/**
	 * Initialize the renderer for the given canvas
	 */
	public initialize(canvasHandle: CanvasHandle): void {
		GameRenderConfig.initialize();
		this.renderGraph = new GameRenderGraph(this.changeProvider, this.repository, canvasHandle.getGL(), () => this.renderConfig!)
		this.renderGraph.initialize()
	}

	/**
	 * Render a new frame
	 */
	public render(canvasHandle: CanvasHandle) {
		const camera = this.getRenderCamera(canvasHandle);
		this.changeProvider.prepareFrame(camera);
		this.renderConfig = GameRenderConfig.load();

		this.renderGraph?.updateCamera(camera)
		this.renderGraph?.execute()
	}

	/**
	 * Dispose the renderer and all resources
	 */
	public dispose() {
		this.renderGraph?.dispose();
		this.renderGraph = null;
	}

	private getRenderCamera(canvasHandle: CanvasHandle): Camera {
		const data = this.repository.getCamera();
		return Camera.create(
			data,
			canvasHandle.getCanvasWidth(),
			canvasHandle.getCanvasHeight(),
			canvasHandle.getClientWidth(),
			canvasHandle.getClientHeight(),
		);
	}

}