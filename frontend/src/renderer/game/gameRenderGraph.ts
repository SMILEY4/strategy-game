import {RenderGraph} from "../common/graph/renderGraph";
import {GameChangeProvider} from "./gameChangeProvider";
import {WebGLRenderGraphSorter} from "../common/webgl/webGLRenderGraphSorter";
import {WebGLResourceManager} from "../common/webgl/webGLResourceManager";
import {GameShaderSourceManager} from "./gameShaderSourceManager";
import {WebGLRenderGraphCompiler} from "../common/webgl/webGLRenderGraphCompiler";
import {VertexFullQuadNode} from "../common/prebuilt/vertexFullquadNode";
import {TilesVertexNode} from "./rendernodes/tilesVertexNode";
import {OverlayVertexNode} from "./rendernodes/overlayVertexNode";
import {TilesWaterDrawNode} from "./rendernodes/tilesWaterDrawNode";
import {TilesLandDrawNode} from "./rendernodes/tilesLandDrawNode";
import {TilesFogDrawNode} from "./rendernodes/tilesFogDrawNode";
import {OverlayDrawNode} from "./rendernodes/overlayDrawNode";
import {CombineLayersDrawNode} from "./rendernodes/combineLayersDrawNode";
import {GameRenderConfig} from "./gameRenderConfig";
import {Camera} from "../../common/webgl/camera";
import {BaseRenderer} from "../../common/webgl/baseRenderer";
import {NoOpRenderGraphSorter} from "../common/prebuilt/NoOpRenderGraphSorter";
import {HtmlResourceManager} from "../common/html/htmlResourceManager";
import {HtmlRenderGraphCompiler} from "../common/html/htmlRenderGraphCompiler";
import {ResourceIconsHtmlNode} from "./rendernodes/resourceIconsHtmlNode";
import {PathsHtmlNode} from "./rendernodes/pathsHtmlNode";
import {LabelsHtmlNode} from "./rendernodes/labelsHtmlNode";
import {TileRepository} from "../../state/repository/tileRepository";
import {SessionRepository} from "../../state/repository/sessionRepository";
import {WorldObjectRepository} from "../../state/repository/worldObjectRepository";
import {SettlementRepository} from "../../state/repository/settlementRepository";
import {RouteRepository} from "../../state/repository/routeRepository";
import {ChangeProvider} from "../common/graph/changeProvider";
import {TilesBaseVertexNode} from "./rendernodes/tilesBaseVertexNode";
import {OverlayBaseVertexNode} from "./rendernodes/overlayBaseVertexNode";
import {GameHtmlRenderContext, GameWebGLRenderContext, RenderContextFactory} from "./gameRenderContext";
import {MapDetailsVertexNode} from "./rendernodes/mapDetailsVertexNode";
import {MapDetailsDrawNode} from "./rendernodes/mapDetailsDrawNode";
import {GameTextureAtlasDataManager} from "./gameTextureAtlasDataManager";

export class GameRenderGraph {

	private readonly renderGraphWebGl: RenderGraph<GameWebGLRenderContext>;
	private readonly renderGraphHtml: RenderGraph<GameHtmlRenderContext>;

	private readonly changeProvider: ChangeProvider;
	private readonly renderer: BaseRenderer;
	private readonly renderContextFactory: RenderContextFactory;

	private camera: Camera = new Camera();

	constructor(
		changeProvider: GameChangeProvider,
		gl: WebGL2RenderingContext,
		tileRepository: TileRepository,
		sessionRepository: SessionRepository,
		worldObjectRepository: WorldObjectRepository,
		settlementRepository: SettlementRepository,
		routeRepository: RouteRepository,
	) {

		this.changeProvider = changeProvider;
		this.renderer = new BaseRenderer(gl);

		this.renderContextFactory = new RenderContextFactory(
			gl,
			this.renderer,
			tileRepository,
			sessionRepository,
			worldObjectRepository,
			settlementRepository,
			routeRepository,
		);

		this.renderGraphWebGl = new RenderGraph<GameWebGLRenderContext>({
			name: "webgl",
			sorter: new WebGLRenderGraphSorter(),
			resourceManager: new WebGLResourceManager(gl, new GameShaderSourceManager(), new GameTextureAtlasDataManager()),
			compiler: new WebGLRenderGraphCompiler(changeProvider),
			nodes: [
				new VertexFullQuadNode(),

				new TilesVertexNode(),
				new TilesBaseVertexNode(),

				new OverlayBaseVertexNode(),
				new OverlayVertexNode(),
				new OverlayDrawNode(),

				new MapDetailsVertexNode(),
				new MapDetailsDrawNode(),

				new TilesWaterDrawNode(),
				new TilesLandDrawNode(),
				new TilesFogDrawNode(),

				new CombineLayersDrawNode(),
			],
		});

		this.renderGraphHtml = new RenderGraph<GameHtmlRenderContext>({
			name: "html",
			sorter: new NoOpRenderGraphSorter(),
			resourceManager: new HtmlResourceManager(),
			compiler: new HtmlRenderGraphCompiler(changeProvider),
			nodes: [
				new PathsHtmlNode(),
				new ResourceIconsHtmlNode(),
				new LabelsHtmlNode(),
			],
		});
	}

	/**
	 * Initialize the render graph
	 */
	public initialize(renderConfig: GameRenderConfig) {
		this.changeProvider.initialize();
		this.renderGraphWebGl.initialize(this.renderContextFactory.createWebGLContext(this.camera, renderConfig));
		this.renderGraphHtml.initialize(this.renderContextFactory.createHtmlContext(this.camera));
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
	public execute(camera: Camera, renderConfig: GameRenderConfig) {
		this.camera = camera;
		this.updateContext(renderConfig);
		this.changeProvider.prepareFrame(camera);
		this.renderGraphWebGl.execute();
		this.renderGraphHtml.execute();
	}

	private updateContext(renderConfig: GameRenderConfig) {
		this.renderGraphWebGl.updateContext(ctx => this.renderContextFactory.createWebGLContext(this.camera, renderConfig));
		this.renderGraphHtml.updateContext(ctx => this.renderContextFactory.createHtmlContext(this.camera));
	}
}