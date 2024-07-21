import {EMPTY_HTML_DATA_RESOURCE, HtmlDataResource, HtmlRenderNode} from "../../core/graph/htmlRenderNode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {Camera} from "../../../shared/webgl/camera";
import {ChangeProvider} from "../changeProvider";
import {buildMap} from "../../../shared/utils";
import {TileIdentifier} from "../../../models/tile";
import {Projections} from "../../../shared/webgl/projections";
import {RenderRepository} from "../renderRepository";

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

		const worldObjects = this.repository.getWorldObjects();
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			elements.push({
				path: [
					{id: "", q: 0, r: 0},
					{id: "", q: 1, r: 0},
					{id: "", q: 1, r: 1},
					{id: "", q: 0, r: 1},
					{id: "", q: 0, r: 2},
				],
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
	path: TileIdentifier[];
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

		const svgMarker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
		svgMarker.id = "movement-arrow";
		svgMarker.style.fill = "red";
		svgMarker.setAttribute("viewBox", "0 0 10 10");
		svgMarker.setAttribute("refX", "5");
		svgMarker.setAttribute("refY", "5");
		svgMarker.setAttribute("markerWidth", "4");
		svgMarker.setAttribute("markerHeight", "4");
		svgMarker.setAttribute("orient", "auto-start-reverse");
		svgMarker.appendChild(svgMarkerPath);

		const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
		svgPath.style.fill = "none";
		svgPath.style.stroke = "red";
		svgPath.style.strokeWidth = "10";
		svgPath.style.strokeLinecap = "round";
		svgPath.style.strokeLinejoin = "round";
		svgPath.setAttribute("d", path)
		svgPath.setAttribute("marker-end", "url(#movement-arrow)");

		const svgDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
		svgDefs.appendChild(svgMarker);

		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 " + camera.getClientWidth() + " " + camera.getClientHeight());
		svg.appendChild(svgDefs);
		svg.appendChild(svgPath);

		html.replaceChildren(svg);

	}
}