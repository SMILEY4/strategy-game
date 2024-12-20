import {RenderGraph} from "../common/graph/renderGraph";
import {WebGLRenderCommand} from "../common/webgl/webGLRenderCommand";
import {HtmlRenderCommand} from "../common/html/htmlRenderCommand";
import {GameChangeProvider} from "./gameChangeProvider";
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
import {ChangeProvider} from "../common/graph/changeProvider";
import {TilesBaseVertexNode} from "./rendernodes/tilesBaseVertexNode";
import {OverlayBaseVertexNode} from "./rendernodes/overlayBaseVertexNode";
import {GameWebGLRenderContext} from "./gameWebGLRenderContext";

export class GameRenderGraph {

	private readonly renderGraphWebGl: RenderGraph<GameWebGLRenderContext>;
	private readonly renderGraphHtml: RenderGraph<HtmlRenderCommand.Context>;

	private readonly gl: WebGL2RenderingContext;
	private readonly changeProvider: ChangeProvider;
	private readonly renderer: BaseRenderer;

	private readonly tileRepository: TileRepository;
	private readonly sessionRepository: SessionRepository;
	private readonly worldObjectRepository: WorldObjectRepository;
	private readonly settlementRepository: SettlementRepository;
	private readonly routeRepository: RouteRepository;

	private camera: Camera = new Camera();

	constructor(
		changeProvider: GameChangeProvider,
		gl: WebGL2RenderingContext,
		renderConfig: () => GameRenderConfig,
		tileRepository: TileRepository,
		sessionRepository: SessionRepository,
		worldObjectRepository: WorldObjectRepository,
		settlementRepository: SettlementRepository,
		routeRepository: RouteRepository,
	) {

		this.gl = gl;
		this.changeProvider = changeProvider;
		this.renderer = new BaseRenderer(this.gl);

		this.tileRepository = tileRepository;
		this.sessionRepository = sessionRepository;
		this.worldObjectRepository = worldObjectRepository;
		this.settlementRepository = settlementRepository;
		this.routeRepository = routeRepository;

		this.renderGraphWebGl = new RenderGraph<GameWebGLRenderContext>({
			name: "webgl",
			sorter: new WebGLRenderGraphSorter(),
			resourceManager: new WebGLResourceManager(gl, new GameShaderSourceManager()),
			compiler: new WebGLRenderGraphCompiler(changeProvider),
			nodes: [
				new VertexFullQuadNode(),
				new TilesVertexNode(renderConfig, tileRepository),
				new TilesBaseVertexNode(),
				new OverlayBaseVertexNode(),
				new OverlayVertexNode(tileRepository, sessionRepository, worldObjectRepository),
				new EntitiesVertexNode(settlementRepository),
				new DetailsVertexNode(),
				new RoutesVertexNode(routeRepository),
				new TilesWaterDrawNode(),
				new TilesLandDrawNode(),
				new TilesFogDrawNode(),
				new OverlayDrawNode(),
				new EntitiesDrawNode(),
				new DetailsDrawNode(),
				new RoutesDrawNode(),
				new CombineLayersDrawNode(),
			],
		});

		this.renderGraphHtml = new RenderGraph<HtmlRenderCommand.Context>({
			name: "html",
			sorter: new NoOpRenderGraphSorter(),
			resourceManager: new HtmlResourceManager(),
			compiler: new HtmlRenderGraphCompiler(changeProvider),
			nodes: [
				new PathsHtmlNode(worldObjectRepository, () => this.camera),
				new ResourceIconsHtmlNode(tileRepository, sessionRepository, () => this.camera),
				new WorldObjectsHtmlNode(changeProvider, worldObjectRepository, () => this.camera),
				new SettlementsHtmlNode(settlementRepository, () => this.camera),
			],
		});
	}

	/**
	 * Initialize the render graph
	 */
	public initialize() {
		this.changeProvider.initialize();
		this.renderGraphWebGl.initialize({
			gl: this.gl,
			renderer: this.renderer,
			camera: this.camera,
			mapMode: this.sessionRepository.getMapMode(),
			timestamp: (Date.now() / 1000) % 10000,
			selectedTile: this.tileRepository.getSelected()
		});
		this.renderGraphHtml.initialize({});
	}

	/**
	 * Dispose this render graphs and free all resources
	 */
	public dispose() {
		this.changeProvider.initialize();
		this.renderGraphWebGl.dispose();
		this.renderGraphHtml.dispose();
	}

	/**
	 * Execute this render graph and draw to screen
	 */
	public execute(camera: Camera) {
		this.camera = camera;
		this.updateContext();
		this.changeProvider.prepareFrame(camera);
		this.renderGraphWebGl.execute();
		this.renderGraphHtml.execute();
	}

	private updateContext() {
		this.renderGraphWebGl.updateContext(ctx => ({
			...ctx,
			camera: this.camera,
			mapMode: this.sessionRepository.getMapMode(),
		}));
		this.renderGraphHtml.updateContext(ctx => ctx);
	}
}