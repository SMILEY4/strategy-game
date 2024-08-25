import {EMPTY_HTML_DATA_RESOURCE, HtmlDataResource, HtmlRenderNode} from "../../core/graph/htmlRenderNode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {Camera} from "../../../shared/webgl/camera";
import {ChangeProvider} from "../changeProvider";
import {buildMap} from "../../../shared/utils";
import {TileIdentifier} from "../../../models/primitives/tile";
import {Projections} from "../../../shared/webgl/projections";
import {RenderRepository} from "../renderRepository";

export class SettlementsHtmlNode extends HtmlRenderNode {

	public static readonly ID = "htmlnode.settlements";

	private readonly changeProvider: ChangeProvider;
	private readonly repository: RenderRepository;
	private readonly camera: () => Camera;

	constructor(
		changeProvider: ChangeProvider,
		renderRepository: RenderRepository,
		camera: () => Camera,
	) {
		super({
			id: SettlementsHtmlNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
				new NodeOutput.HtmlData({
					name: "htmldata.settlements",
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

		const elements: SettlementsElement[] = [];

		const settlements = this.repository.getSettlements();
		for (let i = 0, n = settlements.length; i < n; i++) {
			const settlement = settlements[i];
			if (this.isVisible(settlement.tile, 0)) {
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

	private isVisible(tile: TileIdentifier, padding: number): boolean {
		const camera = this.camera();
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