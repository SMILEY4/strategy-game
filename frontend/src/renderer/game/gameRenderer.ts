import {CanvasHandle} from "../../shared/webgl/canvasHandle";
import {GameWebGlRenderGraph} from "./gameWebGlRenderGraph";
import {Camera} from "../../shared/webgl/camera";
import {GameRenderConfig} from "./gameRenderConfig";
import {ChangeProvider} from "./changeProvider";
import {GameHtmlRenderGraph} from "./gameHtmlRenderGraph";
import {GameRepository} from "../../state/gameRepository";

export class GameRenderer {

	private readonly changeProvider;
	private readonly canvasHandle: CanvasHandle;
	private readonly gameRepository: GameRepository;

	private renderConfig: GameRenderConfig | null = null;
	private webGlRenderGraph: GameWebGlRenderGraph | null = null;
	private htmlRenderGraph: GameHtmlRenderGraph | null = null;

	constructor(
		canvasHandle: CanvasHandle,
		gameRepository: GameRepository,
	) {
		this.canvasHandle = canvasHandle;
		this.gameRepository = gameRepository;
		this.changeProvider = new ChangeProvider(gameRepository);
	}

	public initialize(): void {
		GameRenderConfig.initialize();
		this.webGlRenderGraph = new GameWebGlRenderGraph(this.changeProvider, this.canvasHandle.getGL(), () => this.renderConfig!, this.gameRepository);
		this.webGlRenderGraph.initialize();
		this.htmlRenderGraph = new GameHtmlRenderGraph(this.changeProvider, this.gameRepository);
		this.htmlRenderGraph.initialize();
	}

	public render() {
		const camera = this.getRenderCamera();
		this.changeProvider.prepareFrame(camera);
		this.renderConfig = GameRenderConfig.load();
		this.webGlRenderGraph?.updateCamera(camera);
		this.webGlRenderGraph?.execute();
		this.htmlRenderGraph?.updateCamera(camera);
		this.htmlRenderGraph?.execute();
	}

	public dispose() {
		this.webGlRenderGraph?.dispose();
		this.webGlRenderGraph = null;
		this.htmlRenderGraph?.dispose();
		this.htmlRenderGraph = null;
	}

	private getRenderCamera(): Camera {
		const data = this.gameRepository.getCamera();
		return Camera.create(
			data,
			this.canvasHandle.getCanvasWidth(),
			this.canvasHandle.getCanvasHeight(),
			this.canvasHandle.getClientWidth(),
			this.canvasHandle.getClientHeight(),
		);
	}

}