import {EMPTY_HTML_DATA_RESOURCE, HtmlDataResource, HtmlRenderNode} from "../../common/graph/htmlRenderNode";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {Camera} from "../../../common/webgl/camera";
import {buildMap} from "../../../common/utils";
import {TileIdentifier} from "../../../models/base/tile";
import {Projections} from "../../../common/webgl/projections";
import {WorldObjectType} from "../../../models/base/worldObjectType";
import {GameHtmlRenderContext} from "../gameRenderContext";


export class WorldObjectsHtmlNode extends HtmlRenderNode<GameHtmlRenderContext> {

	public static readonly ID = "htmlnode.worldobjects";

	constructor() {
		super({
			id: WorldObjectsHtmlNode.ID,
			changeKey: WorldObjectsHtmlNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
				new NodeOutput.HtmlData({
					name: "htmldata.worldobjects",
					renderFunction: (context: GameHtmlRenderContext, element: any, html: HTMLElement) => render(context.camera, element, html),
				}),
			],
		});
	}

	public execute(context: GameHtmlRenderContext): HtmlDataResource {
		const elements: WorldObjectIconElement[] = [];

		const worldObjects = context.worldObjects;
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			const worldObject = worldObjects[i];
			if (this.isVisible(worldObject.tile, 0, context.camera)) {
				elements.push({
					tile: worldObject.tile,
					type: worldObject.type,
				});
			}
		}

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.worldobjects": elements,
			}),
		});
	}

	private isVisible(tile: TileIdentifier, padding: number, camera: Camera): boolean {
		const cameraMin = Projections.screenToWorld(camera, 0, camera.getClientHeight());
		const cameraMax = Projections.screenToWorld(camera, camera.getClientWidth(), 0);
		const tilePos = Projections.hexToWorld(tile.q, tile.r);
		return (cameraMin.x - padding) < tilePos.x && tilePos.x < (cameraMax.x + padding)
			&& (cameraMin.y - padding) < tilePos.y && tilePos.y < (cameraMax.y + padding);
	}

}

interface WorldObjectIconElement {
	tile: TileIdentifier,
	type: WorldObjectType,
}

function render(camera: Camera, element: WorldObjectIconElement, html: HTMLElement): void {
	const pos = Projections.hexToScreen(camera, element.tile.q, element.tile.r);
	pos.y = camera.getClientHeight() - pos.y;
	html.className = "world-ui__icon";
	html.style.left = pos.x + "px";
	html.style.top = pos.y + "px";
	html.style.backgroundImage = "url('" + element.type.icon + "')";
	html.textContent = "";
}