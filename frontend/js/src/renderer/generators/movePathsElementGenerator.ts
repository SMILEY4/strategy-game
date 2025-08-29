import {
	RenderElement,
} from "../../common/rendergraph/nodes/renderElementGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {Projections} from "../../common/webgl/projections";
import {Camera} from "../../common/webgl/camera";
import {TileSummary} from "../../models/tile/tileSummary";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";

export namespace MovePathsElementGenerator {

	export const OUTPUT_ID = "movepaths.elements";

	export function funcCreate(context: RenderGraphNodeContext): Map<string, RenderElement[]> {

		const paths = context.get<({ tiles: TileSummary[], pending: boolean })[]>("movePaths");

		const data: PathHtmlData[] = [];

		for (let i = 0, n = paths.length; i < n; i++) {
			const path = paths[i];
			if (path.tiles.length > 0) {
				data.push({
					position: path.tiles[0].position,
					path: paths[i].tiles,
					pending: paths[i].pending,
				});
			}
		}

		return buildMap([
			[
				OUTPUT_ID,
				data,
			],
		]);
	}


	export function funcTemplate(): HTMLElement {
		return document.createElement("div");
	}


	export function funcRender(obj: PathHtmlData, target: HTMLElement, lowQuality: boolean, camera: Camera) {

		let path: string = "";
		for (let i = 0; i < obj.path.length; i++) {
			const pos = Projections.hexToScreen(camera, obj.path[i].position.q, obj.path[i].position.r);
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

		target.className = "world-ui__path" + (obj.pending ? " world-ui__path-pending" : "");
		target.replaceChildren(svg);
		target.style.left = "0px";
		target.style.top = "0px";

	}


	export interface PathHtmlData extends RenderElement {
		path: TileSummary[],
		pending: boolean
	}

}