import {RenderGraph} from "../core/graph/renderGraph";
import {Camera} from "../../shared/webgl/camera";
import {HtmlRenderCommand} from "../core/html/htmlRenderCommand";
import {NoOpRenderGraphSorter} from "../core/prebuilt/NoOpRenderGraphSorter";
import {HtmlResourceManager} from "../core/html/htmlResourceManager";
import {HtmlRenderGraphCompiler} from "../core/html/htmlRenderGraphCompiler";

/**
 * Render graph for html-render-nodes
 */
export class GameRenderGraphHtml extends RenderGraph<HtmlRenderCommand.Context> {

	private camera: Camera = new Camera();

	constructor() {
		super({
			sorter: new NoOpRenderGraphSorter(),
			resourceManager: new HtmlResourceManager(),
			compiler: new HtmlRenderGraphCompiler(),
			nodes: [],
		});
	}

    /**
     * Initialize the render graph
     */
	public initialize() {
		super.initialize({});
	}

    /**
     * Update the camera
     */
	public updateCamera(camera: Camera) {
		this.camera = camera;
		this.updateContext(ctx => ({
			...ctx,
			camera: this.camera,
		}));
	}

    /**
     * Execute this render graph and "draw" to screen
     */
	public execute() {
		super.execute();
	}
}