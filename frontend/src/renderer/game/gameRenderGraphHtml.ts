import {RenderGraph} from "../core/graph/renderGraph";
import {Camera} from "../../shared/webgl/camera";
import {HtmlRenderCommand} from "../core/html/htmlRenderCommand";
import {NoOpRenderGraphSorter} from "../core/prebuilt/NoOpRenderGraphSorter";
import {HtmlResourceManager} from "../core/html/htmlResourceManager";
import {HtmlRenderGraphCompiler} from "../core/html/htmlRenderGraphCompiler";
import {ResourceIconsHtmlNode} from "./rendernodes/resourceIconsHtmlNode";
import {ChangeProvider} from "./changeProvider";
import {RenderRepository} from "./renderRepository";

/**
 * Render graph for html-render-nodes
 */
export class GameRenderGraphHtml extends RenderGraph<HtmlRenderCommand.Context> {

	private camera: Camera = new Camera();

	constructor(changeProvider: ChangeProvider, renderRepository: RenderRepository) {
		super({
			sorter: new NoOpRenderGraphSorter(),
			resourceManager: new HtmlResourceManager(),
			compiler: new HtmlRenderGraphCompiler(),
			nodes: [
				new ResourceIconsHtmlNode(
					changeProvider,
					renderRepository,
					() => this.camera
				)

			],
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