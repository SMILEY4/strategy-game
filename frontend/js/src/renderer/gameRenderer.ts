import {CanvasHandle} from "../common/webgl/canvasHandle";
import {RenderGraph} from "../common/rendergraph/renderGraph";
import {GameRenderGraphFactory} from "./gameRenderGraphFactory";
import {GameStateAccess} from "../state/gameStateAccess";
import {GameChangeTracker} from "./gameChangeTracker";
import {GameTextureAtlasDataManager} from "./gameTextureAtlasDataManager";
import {GameShaderSourceManager} from "./gameShaderSourceManager";
import {Camera} from "../common/webgl/camera";
import {WasmGameRenderer} from "./wasmGameRenderer";

export class GameRenderer {

	private readonly gameStateAccess: GameStateAccess;
	private readonly changeTracker: GameChangeTracker;
	private readonly shaderSourceManager: GameShaderSourceManager;
	private readonly textureAtlasManager: GameTextureAtlasDataManager;
	private readonly wasmGameRenderer: WasmGameRenderer;

	private gameRenderGraph: RenderGraph | null = null;

	constructor(
		gameStateAccess: GameStateAccess,
		changeTracker: GameChangeTracker,
		shaderSourceManager: GameShaderSourceManager,
		textureAtlasManager: GameTextureAtlasDataManager,
		wasmGameRenderer: WasmGameRenderer,
	) {
		this.gameStateAccess = gameStateAccess;
		this.changeTracker = changeTracker;
		this.shaderSourceManager = shaderSourceManager;
		this.textureAtlasManager = textureAtlasManager;
		this.wasmGameRenderer = wasmGameRenderer;
	}

	/**
	 * Initialize the renderer for the given canvas
	 */
	public initialize(canvasHandle: CanvasHandle): void {
		this.wasmGameRenderer.init();
		const factory = new GameRenderGraphFactory();
		this.changeTracker.initialize();
		this.gameRenderGraph = factory.create(
			this.gameStateAccess,
			this.changeTracker,
			canvasHandle,
			this.shaderSourceManager,
			this.textureAtlasManager,
			this.wasmGameRenderer,
		);
		factory.initialize(this.gameRenderGraph);
	}

	/**
	 * Render a new frame
	 */
	public render(canvasHandle: CanvasHandle) {
		if (!canvasHandle.isReady()) {
			return;
		}
		this.changeTracker.prepareFrame(this.getRenderCamera(canvasHandle));
		this.gameRenderGraph?.execute();
	}

	/**
	 * Dispose the renderer and all resources
	 */
	public dispose() {
		this.wasmGameRenderer.dispose();
		this.gameRenderGraph?.dispose();
		this.gameRenderGraph = null;
	}

	private getRenderCamera(canvasHandle: CanvasHandle): Camera {
		const data = this.gameStateAccess.getCamera();
		return Camera.create(
			data,
			canvasHandle.getCanvasWidth(),
			canvasHandle.getCanvasHeight(),
			canvasHandle.getClientWidth(),
			canvasHandle.getClientHeight(),
		);
	}

}