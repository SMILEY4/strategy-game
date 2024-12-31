import {CanvasHandle} from "../../common/webgl/canvasHandle";
import {Camera} from "../../common/webgl/camera";
import {GameRenderConfig} from "./gameRenderConfig";
import {GameChangeProvider} from "./gameChangeProvider";
import {GameRenderGraph} from "./gameRenderGraph";
import {CameraRepository} from "../../state/repository/cameraRepository";
import {TileRepository} from "../../state/repository/tileRepository";
import {SessionRepository} from "../../state/repository/sessionRepository";
import {WorldObjectRepository} from "../../state/repository/worldObjectRepository";
import {SettlementRepository} from "../../state/repository/settlementRepository";
import {RouteRepository} from "../../state/repository/routeRepository";

/**
 * Renderer
 */
export class GameRenderer {

	private readonly changeProvider: GameChangeProvider;
	private readonly cameraRepository: CameraRepository;
	private readonly tileRepository: TileRepository;
	private readonly sessionRepository: SessionRepository;
	private readonly worldObjectRepository: WorldObjectRepository;
	private readonly settlementRepository: SettlementRepository;
	private readonly routeRepository: RouteRepository;

	private renderConfig: GameRenderConfig | null = null;
	private renderGraph: GameRenderGraph | null = null;

	constructor(
		changeProvider: GameChangeProvider,
		cameraRepository: CameraRepository,
		tileRepository: TileRepository,
		sessionRepository: SessionRepository,
		worldObjectRepository: WorldObjectRepository,
		settlementRepository: SettlementRepository,
		routeRepository: RouteRepository,
	) {
		this.changeProvider = changeProvider;
		this.cameraRepository = cameraRepository;
		this.tileRepository = tileRepository;
		this.sessionRepository = sessionRepository;
		this.worldObjectRepository = worldObjectRepository;
		this.settlementRepository = settlementRepository;
		this.routeRepository = routeRepository;
	}

	/**
	 * Initialize the renderer for the given canvas
	 */
	public initialize(canvasHandle: CanvasHandle,): void {
		GameRenderConfig.initialize();
		this.renderGraph = new GameRenderGraph(
			this.changeProvider,
			canvasHandle.getGL(),
			this.tileRepository,
			this.sessionRepository,
			this.worldObjectRepository,
			this.settlementRepository,
			this.routeRepository,
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

		this.checkWebGLErrors(canvasHandle.getGL())
	}

	private checkWebGLErrors(gl: WebGL2RenderingContext) {
		let error = gl.getError();
		while(error !== gl.NO_ERROR) {
			let strError = "" + error
			if(error === gl.INVALID_ENUM) strError = "INVALID_ENUM"
			if(error === gl.INVALID_VALUE) strError = "INVALID_VALUE"
			if(error === gl.INVALID_OPERATION) strError = "INVALID_OPERATION"
			if(error === gl.INVALID_FRAMEBUFFER_OPERATION) strError = "INVALID_FRAMEBUFFER_OPERATION"
			if(error === gl.OUT_OF_MEMORY) strError = "OUT_OF_MEMORY"
			if(error === gl.CONTEXT_LOST_WEBGL) strError = "CONTEXT_LOST_WEBGL"

			console.error('Unhandled WebGL error', strError);

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