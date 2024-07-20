import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {GameRenderGraphWebGL} from "./gameRenderGraphWebGL";
import {Camera} from "../../shared/webgl/camera";
import {GameRenderConfig} from "./gameRenderConfig";
import {ChangeProvider} from "./changeProvider";
import {GameRenderGraphHtml} from "./gameRenderGraphHtml";
import {RenderRepository} from "./RenderRepository";

/**
 * Renderer
 */
export class GameRenderer {

	private readonly changeProvider;
	private readonly repository: RenderRepository;

	private renderConfig: GameRenderConfig | null = null;
	private webGlRenderGraph: GameRenderGraphWebGL | null = null;
	private htmlRenderGraph: GameRenderGraphHtml | null = null;

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
		this.webGlRenderGraph = new GameRenderGraphWebGL(this.changeProvider, canvasHandle.getGL(), () => this.renderConfig!, this.repository);
		this.htmlRenderGraph = new GameRenderGraphHtml();
		this.webGlRenderGraph.initialize();
		this.htmlRenderGraph.initialize();
	}

	/**
	 * Render a new frame
	 */
	public render(canvasHandle: CanvasHandle) {
		const camera = this.getRenderCamera(canvasHandle);
		this.changeProvider.prepareFrame(camera);
		this.renderConfig = GameRenderConfig.load();

		this.webGlRenderGraph?.updateCamera(camera);
		this.webGlRenderGraph?.execute();

		this.htmlRenderGraph?.updateCamera(camera);
		this.htmlRenderGraph?.execute();
	}

	/**
	 * Dispose the renderer and all resources
	 */
	public dispose() {
		this.webGlRenderGraph?.dispose();
		this.htmlRenderGraph?.dispose();
		this.webGlRenderGraph = null;
		this.htmlRenderGraph = null;
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