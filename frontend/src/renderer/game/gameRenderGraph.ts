import {RenderGraph} from "../common/graph/renderGraph";
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
import {HtmlResourceManager} from "../common/html/htmlResourceManager";
import {HtmlRenderGraphCompiler} from "../common/html/htmlRenderGraphCompiler";
import {ChangeProvider} from "../common/graph/changeProvider";
import {TilesBaseVertexNode} from "./rendernodes/tilesBaseVertexNode";
import {OverlayBaseVertexNode} from "./rendernodes/overlayBaseVertexNode";
import {GameHtmlRenderContext, GameWebGLRenderContext, RenderContextFactory} from "./gameRenderContext";
import {MapDetailsVertexNode} from "./rendernodes/mapDetailsVertexNode";
import {MapDetailsDrawNode} from "./rendernodes/mapDetailsDrawNode";
import {GameTextureAtlasDataManager} from "./gameTextureAtlasDataManager";
import {GameStateAccess} from "../../state/gameStateAccess";
import {RenderGraphMonitor} from "../common/graph/renderGraphMonitor";
import {HtmlRenderGraphSorter} from "../common/html/htmlRenderGraphSorter";
import {ResourceIconsHtmlNode} from "./rendernodes/resourceIconsHtmlNode";
import {GameHtmlOutputNode} from "./rendernodes/gameHtmlOutputNode";
import {LabelsHtmlNode} from "./rendernodes/labelsHtmlNode";
import {PathsHtmlNode} from "./rendernodes/pathsHtmlNode";

export class GameRenderGraph {

	private readonly renderGraphWebGl: RenderGraph<GameWebGLRenderContext>;
	private readonly renderGraphHtml: RenderGraph<GameHtmlRenderContext>;

	private readonly changeProvider: ChangeProvider;
	private readonly renderer: BaseRenderer;
	private readonly renderContextFactory: RenderContextFactory;

	private camera: Camera = new Camera();

	constructor(changeProvider: ChangeProvider, gl: WebGL2RenderingContext, monitor: RenderGraphMonitor, localStateAccess: GameStateAccess) {

		this.changeProvider = changeProvider;
		this.renderer = new BaseRenderer(gl);

		this.renderContextFactory = new RenderContextFactory(gl, this.renderer, monitor, localStateAccess);

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
			sorter: new HtmlRenderGraphSorter(),
			resourceManager: new HtmlResourceManager(),
			compiler: new HtmlRenderGraphCompiler(changeProvider),
			nodes: [
				new LabelsHtmlNode(),
				new PathsHtmlNode(),
				new ResourceIconsHtmlNode(),
				new GameHtmlOutputNode(),
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