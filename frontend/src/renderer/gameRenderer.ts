import {CanvasHandle} from "../common/webgl/canvasHandle";
import {RenderGraph} from "../common/rendergraph/renderGraph";
import {GameRenderGraphFactory} from "./gameRenderGraphFactory";
import {GameStateAccess} from "../state/gameStateAccess";
import {GameChangeTracker} from "./gameChangeTracker";
import {GameTextureAtlasDataManager} from "./gameTextureAtlasDataManager";
import {GameShaderSourceManager} from "./gameShaderSourceManager";
import {Camera} from "../common/webgl/camera";
import {WasmApi} from "../wasm/wasmApi";
import {WasmProbe} from "../wasm/wasmProbe";

export class GameRenderer {

	private readonly gameStateAccess: GameStateAccess;
	private readonly changeTracker: GameChangeTracker;
	private readonly shaderSourceManager: GameShaderSourceManager;
	private readonly textureAtlasManager: GameTextureAtlasDataManager;

	private gameRenderGraph: RenderGraph | null = null;

	private frameCounter = 0;

	constructor(
		gameStateAccess: GameStateAccess,
		changeTracker: GameChangeTracker,
		shaderSourceManager: GameShaderSourceManager,
		textureAtlasManager: GameTextureAtlasDataManager,
	) {
		this.gameStateAccess = gameStateAccess;
		this.changeTracker = changeTracker;
		this.shaderSourceManager = shaderSourceManager;
		this.textureAtlasManager = textureAtlasManager;
	}

	/**
	 * Initialize the renderer for the given canvas
	 */
	public initialize(canvasHandle: CanvasHandle): void {
		const factory = new GameRenderGraphFactory();
		this.changeTracker.initialize();
		this.gameRenderGraph = factory.create(
			this.gameStateAccess,
			this.changeTracker,
			canvasHandle,
			this.shaderSourceManager,
			this.textureAtlasManager,
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

		// WasmProbe.watchMemory("render")
		//
		// if(this.frameCounter < 10) {
		// 	WasmApi.Renderer.setTiles(this.gameStateAccess.getTiles());
		// }
		// this.frameCounter++;

		this.changeTracker.prepareFrame(this.getRenderCamera(canvasHandle));
		this.gameRenderGraph?.execute();
	}

	/**
	 * Dispose the renderer and all resources
	 */
	public dispose() {
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