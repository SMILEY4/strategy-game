import {HtmlDataResource, HtmlRenderNode} from "../../common/graph/htmlRenderNode";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {Camera} from "../../../common/webgl/camera";
import {buildMap} from "../../../common/utils";
import {Projections} from "../../../common/webgl/projections";
import {TilePosition} from "../../../models/base/tilePosition";
import {WorldObjectRepository} from "../../../state/repository/worldObjectRepository";

export class PathsHtmlNode extends HtmlRenderNode {

	public static readonly ID = "htmlnode.paths";

	private readonly worldObjectRepository: WorldObjectRepository;
	private readonly camera: () => Camera;

	constructor(worldObjectRepository: WorldObjectRepository, camera: () => Camera) {
		super({
			id: PathsHtmlNode.ID,
			changeKey: PathsHtmlNode.ID,
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
		this.worldObjectRepository = worldObjectRepository;
		this.camera = camera;
	}

	public execute(): HtmlDataResource {

		const elements: PathsElement[] = [];

		const paths = this.worldObjectRepository.getMovementPaths();
		for (let i = 0, n = paths.length; i < n; i++) {
			elements.push({
				path: paths[i].positions,
				pending: paths[i].pending,
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
		svgPath.setAttribute("d", path);
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