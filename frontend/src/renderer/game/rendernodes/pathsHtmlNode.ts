import {GameHtmlRenderContext} from "../gameRenderContext";
import {HtmlDataEntry, HtmlDataResource, HtmlNode} from "../../common/graph/htmlNode";
import {TileSummary} from "../../../models/tile/tileSummary";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {Projections} from "../../../common/webgl/projections";

export class PathsHtmlNode extends HtmlNode<GameHtmlRenderContext> {

	public static readonly ID = "html.paths";

	constructor() {
		super({
			id: PathsHtmlNode.ID,
			changeKey: PathsHtmlNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlData({
					name: "htmldata.paths",
					boundsRadiusTiles: 9999999,
					lowQualityThreshold: null,
					htmlFactory: PathsHtmlNode.createHtmlElement,
					renderFunc: PathsHtmlNode.render,
				}),
			],
		});
	}

	execute(context: GameHtmlRenderContext): HtmlDataResource {

		const data: PathsHtmlData[] = [];

		const paths = context.movePaths;
		for (let i = 0, n = paths.length; i < n; i++) {
			const path = paths[i];
			if (path.tiles.length > 0) {
				data.push({
					tile: path.tiles[0],
					path: paths[i].tiles,
					pending: paths[i].pending,
				});
			}
		}

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.paths": data,
			}),
		});
	}

	static createHtmlElement(): HTMLElement {
		return document.createElement("div");
	}


	static render(context: GameHtmlRenderContext, data: PathsHtmlData, baseElement: HTMLElement, _: boolean) {

		var path: string = "";
		for (let i = 0; i < data.path.length; i++) {
			const pos = Projections.hexToScreen(context.camera, data.path[i].position.q, data.path[i].position.r);
			if (i == 0) {
				path += "M " + pos.x + " " + (context.camera.getClientHeight() - pos.y);
			} else {
				path += "L " + pos.x + " " + (context.camera.getClientHeight() - pos.y);
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

		baseElement.className = "world-ui__path" + (data.pending ? " world-ui__path-pending" : "");
		baseElement.replaceChildren(svg);
		baseElement.style.left = "0px";
		baseElement.style.top = "0px";

	}

}

export interface PathsHtmlData extends HtmlDataEntry {
	path: TileSummary[];
	pending: boolean,
}