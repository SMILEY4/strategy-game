import {RenderGraph} from "../core/graph/renderGraph";
import {WebGLRenderCommand} from "../core/webgl/webGLRenderCommand";
import {HtmlRenderCommand} from "../core/html/htmlRenderCommand";
import {ChangeProvider} from "./changeProvider";
import {RenderRepository} from "./renderRepository";
import {WebGLRenderGraphSorter} from "../core/webgl/webGLRenderGraphSorter";
import {WebGLResourceManager} from "../core/webgl/webGLResourceManager";
import {GameShaderSourceManager} from "./shaders/gameShaderSourceManager";
import {WebGLRenderGraphCompiler} from "../core/webgl/webGLRenderGraphCompiler";
import {VertexFullQuadNode} from "../core/prebuilt/vertexFullquadNode";
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
import {Camera} from "../../shared/webgl/camera";
import {BaseRenderer} from "../../shared/webgl/baseRenderer";
import {NoOpRenderGraphSorter} from "../core/prebuilt/NoOpRenderGraphSorter";
import {HtmlResourceManager} from "../core/html/htmlResourceManager";
import {HtmlRenderGraphCompiler} from "../core/html/htmlRenderGraphCompiler";
import {ResourceIconsHtmlNode} from "./rendernodes/resourceIconsHtmlNode";
import {WorldObjectsHtmlNode} from "./rendernodes/worldObjectsHtmlNode";
import {PathsHtmlNode} from "./rendernodes/pathsHtmlNode";
import {SettlementsHtmlNode} from "./rendernodes/settlementsHtmlNode";

export class GameRenderGraph {

	private readonly renderGraphWebGl: RenderGraph<WebGLRenderCommand.Context>;
	private readonly renderGraphHtml: RenderGraph<HtmlRenderCommand.Context>;

	private readonly gl: WebGL2RenderingContext;
	private readonly renderer: BaseRenderer;

	private camera: Camera = new Camera();

	constructor(
		changeProvider: ChangeProvider,
		renderRepository: RenderRepository,
		gl: WebGL2RenderingContext,
		renderConfig: () => GameRenderConfig,
	) {

		this.gl = gl;
		this.renderer = new BaseRenderer(this.gl);

		this.renderGraphWebGl = new RenderGraph<WebGLRenderCommand.Context>({
			sorter: new WebGLRenderGraphSorter(),
			resourceManager: new WebGLResourceManager(gl, new GameShaderSourceManager()),
			compiler: new WebGLRenderGraphCompiler(),
			nodes: [
				new VertexFullQuadNode(),
				new TilesVertexNode(changeProvider, renderConfig, renderRepository),
				new OverlayVertexNode(changeProvider, renderRepository),
				new EntitiesVertexNode(changeProvider, renderRepository),
				new DetailsVertexNode(changeProvider),
				new RoutesVertexNode(changeProvider),
				new TilesWaterDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new TilesLandDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new TilesFogDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new OverlayDrawNode(renderRepository, () => this.camera.getViewProjectionMatrixOrThrow()),
				new EntitiesDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new DetailsDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new RoutesDrawNode(() => this.camera.getViewProjectionMatrixOrThrow()),
				new CombineLayersDrawNode(renderRepository, () => this.camera),
			],
		});

		this.renderGraphHtml = new RenderGraph<HtmlRenderCommand.Context>({
			sorter: new NoOpRenderGraphSorter(),
			resourceManager: new HtmlResourceManager(),
			compiler: new HtmlRenderGraphCompiler(),
			nodes: [
				new PathsHtmlNode(changeProvider, renderRepository, () => this.camera,),
				new ResourceIconsHtmlNode(changeProvider, renderRepository, () => this.camera,),
				new WorldObjectsHtmlNode(changeProvider, renderRepository, () => this.camera,),
				new SettlementsHtmlNode(changeProvider, renderRepository, () => this.camera,),
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
		this.renderGraphWebGl.dispose()
		this.renderGraphWebGl.dispose()
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