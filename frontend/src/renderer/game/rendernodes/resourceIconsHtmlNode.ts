import {HtmlDataResource, HtmlRenderNode} from "../../common/graph/htmlRenderNode";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {Camera} from "../../../common/webgl/camera";
import {buildMap} from "../../../common/utils";
import {MapMode} from "../../../models/base/mapMode";
import {Tile, TileIdentifier} from "../../../models/base/tile";
import {Projections} from "../../../common/webgl/projections";
import {TileResourceType} from "../../../models/base/TileResourceType";
import {GameHtmlRenderContext} from "../gameRenderContext";

export class ResourceIconsHtmlNode extends HtmlRenderNode<GameHtmlRenderContext> {

	public static readonly ID = "htmlnode.resourceicons";

	constructor() {
		super({
			id: ResourceIconsHtmlNode.ID,
			changeKey: ResourceIconsHtmlNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
				new NodeOutput.HtmlData({
					name: "htmldata.resourceicons",
					renderFunction: (context: GameHtmlRenderContext, element: any, html: HTMLElement) => render(context.camera, element, html),
				}),
			],
		});
	}

	public execute(context: GameHtmlRenderContext): HtmlDataResource {

		const elements: ResourceIconElement[] = [];

		if (context.camera.getZoom() > 3) {
			if (context.mapMode == MapMode.RESOURCES) {
				const tiles = context.tiles;
				for (let i = 0, n = tiles.length; i < n; i++) {
					const tile = tiles[i];
					if (!tile.base.visible) {
						continue;
					}
					if (tile.base.value.resourceType !== TileResourceType.NONE && this.isVisible(tile, 0, context.camera)) {
						elements.push({
							tile: tile.identifier,
							type: tile.base.value.resourceType,
						});
					}
				}
			}
		}

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.resourceicons": elements,
			}),
		});
	}

	private isVisible(tile: Tile, padding: number, camera: Camera): boolean {
		const cameraMin = Projections.screenToWorld(camera, 0, camera.getClientHeight());
		const cameraMax = Projections.screenToWorld(camera, camera.getClientWidth(), 0);
		const tilePos = Projections.hexToWorld(tile.identifier.q, tile.identifier.r);
		return (cameraMin.x - padding) < tilePos.x && tilePos.x < (cameraMax.x + padding)
			&& (cameraMin.y - padding) < tilePos.y && tilePos.y < (cameraMax.y + padding);
	}

}

interface ResourceIconElement {
	tile: TileIdentifier,
	type: TileResourceType,
}

function render(camera: Camera, element: ResourceIconElement, html: HTMLElement): void {
	const pos = Projections.hexToScreen(camera, element.tile.q, element.tile.r);
	pos.y = camera.getClientHeight() - pos.y;
	html.className = "world-ui__icon";
	html.style.left = pos.x + "px";
	html.style.top = pos.y + "px";
	html.style.backgroundImage = "url('" + element.type.getIconPath() + "')";
	html.textContent = "";
}