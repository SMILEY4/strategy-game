import {RenderGraph} from "../common/graph/renderGraph";
import {WebGLRenderCommand} from "../common/webgl/webGLRenderCommand";
import {HtmlRenderCommand} from "../common/html/htmlRenderCommand";
import {ChangeProvider} from "./changeProvider";
import {WebGLRenderGraphSorter} from "../common/webgl/webGLRenderGraphSorter";
import {WebGLResourceManager} from "../common/webgl/webGLResourceManager";
import {GameShaderSourceManager} from "./shaders/gameShaderSourceManager";
import {WebGLRenderGraphCompiler} from "../common/webgl/webGLRenderGraphCompiler";
import {VertexFullQuadNode} from "../common/prebuilt/vertexFullquadNode";
import {TilesVertexNode} from "./rendernodes/tilesVertexNode";
import {OverlayVertexNode} from "./rendernodes/overlayVertexNode";
import {EntitiesVertexNode} from "./rendernodes/entitiesVertexNode";
import {DetailsVertexNode} from "./rendernodes/detailsVertexNode";
import {RoutesVertexNode} from "./rendernodes/routesVertexNode";
import {TilesWaterDrawNode} from "./rendernodes/tilesWaterDrawNode";
import {TilesLandDrawNode} from "./rendernodes/tilesLandDrawNode";
import {TilesFogDrawNode} from "./rendernodes/tilesFogDrawNode";
import {OverlayDrawNode} from "./rendernodes/overlayDrawNode";
import {EntitiesDrawNode} from "./rendernodes/entitiesDrawNode";
import {DetailsDrawNode} from "./rendernodes/detailsDrawNode";
import {RoutesDrawNode} from "./rendernodes/routesDrawNode";
import {CombineLayersDrawNode} from "./rendernodes/combineLayersDrawNode";
import {GameRenderConfig} from "./gameRenderConfig";
import {Camera} from "../../common/webgl/camera";
import {BaseRenderer} from "../../common/webgl/baseRenderer";
import {NoOpRenderGraphSorter} from "../common/prebuilt/NoOpRenderGraphSorter";
import {HtmlResourceManager} from "../common/html/htmlResourceManager";
import {HtmlRenderGraphCompiler} from "../common/html/htmlRenderGraphCompiler";
import {ResourceIconsHtmlNode} from "./rendernodes/resourceIconsHtmlNode";
import {WorldObjectsHtmlNode} from "./rendernodes/worldObjectsHtmlNode";
import {PathsHtmlNode} from "./rendernodes/pathsHtmlNode";
import {SettlementsHtmlNode} from "./rendernodes/settlementsHtmlNode";
import {TileRepository} from "../../state/repository/tileRepository";
import {SessionRepository} from "../../state/repository/sessionRepository";
import {WorldObjectRepository} from "../../state/repository/worldObjectRepository";
import {SettlementRepository} from "../../state/repository/settlementRepository";
import {RouteRepository} from "../../state/repository/routeRepository";

export class GameRenderGraph {

	private readonly renderGraphWebGl: RenderGraph<WebGLRenderCommand.Context>;
	private readonly renderGraphHtml: RenderGraph<HtmlRenderCommand.Context>;

	private readonly gl: WebGL2RenderingContext;
	private readonly renderer: BaseRenderer;

	private camera: Camera = new Camera();

	constructor(
		changeProvider: ChangeProvider,
		gl: WebGL2RenderingContext,
		renderConfig: () => GameRenderConfig,
		tileRepository: TileRepository,
		sessionRepository: SessionRepository,
		worldObjectRepository: WorldObjectRepository,
		settlementRepository: SettlementRepository,
		routeRepository: RouteRepository
	) {

		this.gl = gl;
		this.renderer = new BaseRenderer(this.gl);

		this.renderGraphWebGl = new RenderGraph<WebGLRenderCommand.Context>({
			sorter: new WebGLRenderGraphSorter(),
			resourceManager: new WebGLResourceManager(gl, new GameShaderSourceManager()),
			compiler: new WebGLRenderGraphCompiler(),
			nodes: [
				new VertexFullQuadNode(),
				new TilesVertexNode(changeProvider, renderConfig, tileRepository),
				new OverlayVertexNode(changeProvider, tileRepository, sessionRepository, worldObjectRepository),
				new EntitiesVertexNode(changeProvider, settlementRepository),
				new DetailsVertexNode(changeProvider),
				new RoutesVertexNode(changeProvider, routeRepository),
				new TilesWaterDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new TilesLandDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new TilesFogDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new OverlayDrawNode(tileRepository, () => this.camera.getViewProjectionMatrixOrThrow()),
				new EntitiesDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new DetailsDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new RoutesDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new CombineLayersDrawNode(sessionRepository, () => this.camera),
			],
		});

		this.renderGraphHtml = new RenderGraph<HtmlRenderCommand.Context>({
			sorter: new NoOpRenderGraphSorter(),
			resourceManager: new HtmlResourceManager(),
			compiler: new HtmlRenderGraphCompiler(),
			nodes: [
				new PathsHtmlNode(changeProvider, worldObjectRepository, () => this.camera),
				new ResourceIconsHtmlNode(changeProvider, tileRepository, sessionRepository, () => this.camera),
				new WorldObjectsHtmlNode(changeProvider, worldObjectRepository, () => this.camera),
				new SettlementsHtmlNode(changeProvider, settlementRepository, () => this.camera),
			],
		});
	}

	/**
	 * Initialize the render graph
	 */
	public initialize() {
		this.renderGraphWebGl.initialize({
			gl: this.gl,
			renderer: this.renderer,
			camera: this.camera,
		});
		this.renderGraphHtml.initialize({});
	}

	/**
	 * Dispose this render graphs and free all resources
	 */
	public dispose() {
		this.renderGraphWebGl.dispose();
		this.renderGraphWebGl.dispose();
	}

	/**
	 * Update the camera
	 */
	public updateCamera(camera: Camera) {
		this.camera = camera;
		this.renderGraphWebGl.updateContext(ctx => ({
			...ctx,
			camera: this.camera,
		}));
		this.renderGraphHtml.updateContext(ctx => ({
			...ctx,
			camera: this.camera,
		}));
	}

	/**
	 * Execute this render graph and draw to screen
	 */
	public execute() {
		this.renderGraphWebGl.execute();
		this.renderGraphHtml.execute();
	}
}