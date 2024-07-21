import {EMPTY_HTML_DATA_RESOURCE, HtmlDataResource, HtmlRenderNode} from "../../core/graph/htmlRenderNode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {Camera} from "../../../shared/webgl/camera";
import {ChangeProvider} from "../changeProvider";
import {buildMap} from "../../../shared/utils";
import {MapMode} from "../../../models/mapMode";
import {Tile, TileIdentifier} from "../../../models/tile";
import {Projections} from "../../../shared/webgl/projections";
import {RenderRepository} from "../renderRepository";
import {TileResourceType} from "../../../models/TileResourceType";
import {WorldObjectType} from "../../../models/worldObjectType";
import * as path from "node:path";
import Point = Projections.Point;

var dirty = true

export class WorldObjectsHtmlNode extends HtmlRenderNode {

	public static readonly ID = "htmlnode.worldobjects"

	private readonly changeProvider: ChangeProvider;
	private readonly repository: RenderRepository;
	private readonly camera: () => Camera;

	constructor(
		changeProvider: ChangeProvider,
		renderRepository: RenderRepository,
		camera: () => Camera,
	) {
		super({
			id: WorldObjectsHtmlNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
				new NodeOutput.HtmlData({
					name: "htmldata.worldobjects",
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
			dirty = false
			return EMPTY_HTML_DATA_RESOURCE;
		}

		const elements: WorldObjectIconElement[] = [];

		const worldObjects = this.repository.getWorldObjects();
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			const worldObject = worldObjects[i];
			if (this.isVisible(worldObject.tile, 0)) {
				elements.push({
					tile: worldObject.tile,
					type: worldObject.type,
				});
			}
		}

		dirty = true
		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.worldobjects": elements,
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