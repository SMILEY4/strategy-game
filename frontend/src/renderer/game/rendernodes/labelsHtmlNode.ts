import {HtmlDataResource, HtmlRenderNode} from "../../common/graph/htmlRenderNode";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {Camera} from "../../../common/webgl/camera";
import {buildMap} from "../../../common/utils";
import {TileIdentifier} from "../../../models/base/tile";
import {Projections} from "../../../common/webgl/projections";
import {GameHtmlRenderContext} from "../gameRenderContext";
import {WorldObjectType} from "../../../models/base/worldObjectType";
import {TilemapUtils} from "../../../common/tilemapUtils";

export class LabelsHtmlNode extends HtmlRenderNode<GameHtmlRenderContext> {

	public static readonly ID = "htmlnode.labels";

	constructor() {
		super({
			id: LabelsHtmlNode.ID,
			changeKey: LabelsHtmlNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
				new NodeOutput.HtmlData({
					name: "htmldata.labels",
					renderFunction: (context: GameHtmlRenderContext, element: any, html: HTMLElement) => render(context.camera, element, html),
				}),
			],
		});
	}

	public execute(context: GameHtmlRenderContext): HtmlDataResource {

		const elementsByTile = new Map<string, LabelElement[]>();

		function addElement(element: LabelElement) {
			if(elementsByTile.has(element.tile.id)) {
				elementsByTile.get(element.tile.id)?.push(element);
			} else {
				elementsByTile.set(element.tile.id, [element])
			}
		}

		const settlements = context.settlements;
		for (let i = 0, n = settlements.length; i < n; i++) {
			const settlement = settlements[i];
			if (this.isVisible(settlement.tile, 10, context.camera)) {
				addElement({
					type: "location",
					tile: settlement.tile,
					name: settlement.identifier.name,
					color: `rgb(${settlement.country.color.red},${settlement.country.color.green},${settlement.country.color.blue})`,
					index: 0,
				});
			}
		}

		const worldObjects = context.worldObjects;
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			const worldObject = worldObjects[i];
			if (this.isVisible(worldObject.tile, 10, context.camera)) {
				addElement({
					type: "unit",
					tile: worldObject.tile,
					name: worldObject.type.id,
					color: `rgb(${worldObject.country.color.red},${worldObject.country.color.green},${worldObject.country.color.blue})`,
					index: 0,
				});
			}
		}



		const allElements: LabelElement[] = [];
		elementsByTile.forEach((elements, _) => {
			elements.forEach((element, index) => { // todo: sort elements by type
				element.index = index;
				allElements.push(element)
			})
		});

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.labels": allElements,
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

interface LabelElement {
	type: "location" | "unit"
	name: string,
	color: string,
	tile: TileIdentifier,
	index: number,
}

function render(camera: Camera, element: LabelElement, html: HTMLElement): void {

	const pos = Projections.hexToScreen(
		camera,
		element.tile.q, element.tile.r,
		[0, TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 0.5]);
	pos.y = camera.getClientHeight() - pos.y;
	pos.y = pos.y + (element.index * 20);

	html.style.left = pos.x + "px";
	html.style.top = pos.y + "px";
	html.className = "world-ui__label world-ui__label__" + element.type;
	html.textContent = "";
	html.insertAdjacentHTML("afterbegin", "<div class='world-ui__label__outer'><div class='world-ui__label__inner' style='background-color: " + element.color + "'>" + element.name + "</div></div>")
}