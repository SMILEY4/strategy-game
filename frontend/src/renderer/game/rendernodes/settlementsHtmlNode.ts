import {HtmlDataResource, HtmlRenderNode} from "../../common/graph/htmlRenderNode";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {Camera} from "../../../common/webgl/camera";
import {buildMap} from "../../../common/utils";
import {TileIdentifier} from "../../../models/base/tile";
import {Projections} from "../../../common/webgl/projections";
import {GameHtmlRenderContext} from "../gameRenderContext";

export class SettlementsHtmlNode extends HtmlRenderNode<GameHtmlRenderContext> {

	public static readonly ID = "htmlnode.settlements";

	constructor() {
		super({
			id: SettlementsHtmlNode.ID,
			changeKey: SettlementsHtmlNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
				new NodeOutput.HtmlData({
					name: "htmldata.settlements",
					renderFunction: (context: GameHtmlRenderContext, element: any, html: HTMLElement) => render(context.camera, element, html),
				}),
			],
		});
	}

	public execute(context: GameHtmlRenderContext): HtmlDataResource {

		const elements: SettlementsElement[] = [];

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

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.settlements": elements,
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

interface SettlementsElement {
	tile: TileIdentifier,
	name: string,
}

function render(camera: Camera, element: SettlementsElement, html: HTMLElement): void {
	const pos = Projections.hexToScreen(camera, element.tile.q, element.tile.r);
	pos.y = camera.getClientHeight() - pos.y - 20;
	html.className = "world-ui__label";
	html.style.left = pos.x + "px";
	html.style.top = pos.y + "px";
	html.textContent = element.name;
}