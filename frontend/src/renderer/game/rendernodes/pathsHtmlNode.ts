import {EMPTY_HTML_DATA_RESOURCE, HtmlDataResource, HtmlRenderNode} from "../../core/graph/htmlRenderNode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {Camera} from "../../../shared/webgl/camera";
import {ChangeProvider} from "../changeProvider";
import {buildMap} from "../../../shared/utils";
import {Projections} from "../../../shared/webgl/projections";
import {RenderRepository} from "../renderRepository";
import {TilePosition} from "../../../models/tilePosition";
import {Simulate} from "react-dom/test-utils";

export class PathsHtmlNode extends HtmlRenderNode {

	public static readonly ID = "htmlnode.paths";

	private readonly changeProvider: ChangeProvider;
	private readonly repository: RenderRepository;
	private readonly camera: () => Camera;

	constructor(
		changeProvider: ChangeProvider,
		renderRepository: RenderRepository,
		camera: () => Camera,
	) {
		super({
			id: PathsHtmlNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
				new NodeOutput.HtmlData({
					name: "htmldata.paths",
					renderFunction: (element: any, html: HTMLElement) => render(this.camera(), element, html),
				}),
			],
		});
		this.changeProvider = changeProvider;
		this.repository = renderRepository;
		this.camera = camera;
	}

	public execute(): HtmlDataResource {
		if (!this.changeProvider.hasChange(this.id)) {
			return EMPTY_HTML_DATA_RESOURCE;
		}

		const elements: PathsElement[] = [];

		const paths = this.repository.getMovementPaths();
		for (let i = 0, n = paths.length; i < n; i++) {
			elements.push({
				path: paths[i].positions,
				pending: paths[i].pending
			});
		}

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.paths": elements,
			}),
		});
	}

}

interface PathsElement {
	path: TilePosition[];
	pending: boolean,
}

function render(camera: Camera, element: PathsElement, html: HTMLElement): void {
	if (element.path.length > 0) {

		var path: string = "";
		for (let i = 0; i < element.path.length; i++) {
			const pos = Projections.hexToScreen(camera, element.path[i].q, element.path[i].r);
			if (i == 0) {
				path += "M " + pos.x + " " + (camera.getClientHeight() - pos.y);
			} else {
				path += "L " + pos.x + " " + (camera.getClientHeight() - pos.y);
			}
		}

		const svgMarkerPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
		svgMarkerPath.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");

		const svgMarker = document.createElementNS("http://www.w3.org/2000/svg", "marker"); // todo: move arrow to common parent element and reuse by id
		svgMarker.id = "movement-arrow";
		svgMarker.setAttribute("viewBox", "0 0 10 10");
		svgMarker.setAttribute("refX", "5");
		svgMarker.setAttribute("refY", "5");
		svgMarker.setAttribute("markerWidth", "3");
		svgMarker.setAttribute("markerHeight", "3");
		svgMarker.setAttribute("orient", "auto-start-reverse");
		svgMarker.appendChild(svgMarkerPath);

		const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
		svgPath.setAttribute("d", path)
		svgPath.setAttribute("marker-end", "url(#movement-arrow)");

		const svgDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
		svgDefs.appendChild(svgMarker);

		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.appendChild(svgDefs);
		svg.appendChild(svgPath);

		html.className = "world-ui__path" + (element.pending ? " world-ui__path-pending" : "");
		html.replaceChildren(svg);
		html.style.left = "0px";
		html.style.top = "0px";

	}
}