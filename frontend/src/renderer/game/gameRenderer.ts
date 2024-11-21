import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {Camera} from "../../common/webgl/camera";
import {GameRenderConfig} from "./gameRenderConfig";
import {ChangeProvider} from "./changeProvider";
import {GameRenderGraph} from "./gameRenderGraph";
import {CameraRepository} from "../../state/repository/cameraRepository";
import {TileRepository} from "../../state/repository/tileRepository";
import {SessionRepository} from "../../state/repository/sessionRepository";
import {WorldObjectRepository} from "../../state/repository/worldObjectRepository";
import {SettlementRepository} from "../../state/repository/settlementRepository";

/**
 * Renderer
 */
export class GameRenderer {

	private readonly changeProvider: ChangeProvider;
	private readonly cameraRepository: CameraRepository;
	private readonly tileRepository: TileRepository;
	private readonly sessionRepository: SessionRepository;
	private readonly worldObjectRepository: WorldObjectRepository;
	private readonly settlementRepository: SettlementRepository;

	private renderConfig: GameRenderConfig | null = null;
	private renderGraph: GameRenderGraph | null = null;

	constructor(
		changeProvider: ChangeProvider,
		cameraRepository: CameraRepository,
		tileRepository: TileRepository,
		sessionRepository: SessionRepository,
		worldObjectRepository: WorldObjectRepository,
		settlementRepository: SettlementRepository,
	) {
		this.changeProvider = changeProvider;
		this.cameraRepository = cameraRepository;
		this.tileRepository = tileRepository;
		this.sessionRepository = sessionRepository;
		this.worldObjectRepository = worldObjectRepository;
		this.settlementRepository = settlementRepository;
	}

	/**
	 * Initialize the renderer for the given canvas
	 */
	public initialize(
		canvasHandle: CanvasHandle,
	): void {
		GameRenderConfig.initialize();
		this.renderGraph = new GameRenderGraph(
			this.changeProvider,
			canvasHandle.getGL(), () => this.renderConfig!,
			this.tileRepository,
			this.sessionRepository,
			this.worldObjectRepository,
			this.settlementRepository,
		);
		this.renderGraph.initialize();
	}

	/**
	 * Render a new frame
	 */
	public render(canvasHandle: CanvasHandle) {
		const camera = this.getRenderCamera(canvasHandle);
		this.changeProvider.prepareFrame(camera);
		this.renderConfig = GameRenderConfig.load();

		this.renderGraph?.updateCamera(camera);
		this.renderGraph?.execute();
	}

	/**
	 * Dispose the renderer and all resources
	 */
	public dispose() {
		this.renderGraph?.dispose();
		this.renderGraph = null;
	}

	private getRenderCamera(canvasHandle: CanvasHandle): Camera {
		const data = this.cameraRepository.get();
		return Camera.create(
			data,
			canvasHandle.getCanvasWidth(),
			canvasHandle.getCanvasHeight(),
			canvasHandle.getClientWidth(),
			canvasHandle.getClientHeight(),
		);
	}

}