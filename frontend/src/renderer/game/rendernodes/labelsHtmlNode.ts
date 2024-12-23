import {HtmlDataResource, HtmlRenderNode} from "../../common/graph/htmlRenderNode";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {Camera} from "../../../common/webgl/camera";
import {buildMap} from "../../../common/utils";
import {TileIdentifier} from "../../../models/base/tile";
import {Projections} from "../../../common/webgl/projections";
import {GameHtmlRenderContext} from "../gameRenderContext";
import {WorldObjectType} from "../../../models/base/worldObjectType";

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

		const elements: LabelElement[] = [];

		const settlements = context.settlements;
		for (let i = 0, n = settlements.length; i < n; i++) {
			const settlement = settlements[i];
			if (this.isVisible(settlement.tile, 0, context.camera)) {
				elements.push({
					tile: settlement.tile,
					name: settlement.identifier.name,
				});
			}
		}

		const worldObjects = context.worldObjects;
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			const worldObject = worldObjects[i];
			elements.push({
				tile: worldObject.tile,
				name: worldObject.type.id,
			});
		}

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.labels": elements,
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
	tile: TileIdentifier,
	name: string,
}

function render(camera: Camera, element: LabelElement, html: HTMLElement): void {
	const pos = Projections.hexToScreen(camera, element.tile.q, element.tile.r);
	pos.y = camera.getClientHeight() - pos.y - 20;
	html.className = "world-ui__label";
	html.style.left = pos.x + "px";
	html.style.top = pos.y + "px";
	html.textContent = element.name;
}