import {GameHtmlRenderContext} from "../gameRenderContext";
import {HtmlDataEntry, HtmlNode, HtmlDataResource} from "../../common/graph/nodes/htmlNode";
import {TileSummary} from "../../../models/tile/tileSummary";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodes/nodeOutput";
import {TileResourceType} from "../../../models/tile/TileResourceType";
import {MapMode} from "../../../models/misc/mapMode";
import {Projections} from "../../../common/webgl/projections";

export class ResourceIconsDataNode extends HtmlNode<GameHtmlRenderContext> {

	public static readonly ID = "html.resourceIcons";

	constructor() {
		super({
			id: ResourceIconsDataNode.ID,
			changeKey: ResourceIconsDataNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlData({
					name: "htmldata.resourceicons",
					boundsRadiusTiles: 1,
					lowQualityThreshold: 500,
					htmlFactory: ResourceIconsDataNode.createHtmlElement,
					renderFunc: ResourceIconsDataNode.render,
				}),
			],
		});
	}

	execute(context: GameHtmlRenderContext): HtmlDataResource {
		const data: ResourceIconsHtmlData[] = [];
		if (context.mapMode == MapMode.RESOURCES) {
			const tiles = context.tiles;
			for (let i = 0, n = tiles.length; i < n; i++) {
				const tile = tiles[i];
				// todo: for performance testing
				// if (!tile.base.visible) {
				// 	continue;
				// }
				// if (tile.base.value.resourceType !== TileResourceType.NONE) {
				// 	data.push({
				// 		tile: TileSummary.from(tile),
				// 		type: tile.base.value.resourceType,
				// 	});
				// }
				data.push({
					tile: TileSummary.from(tile),
					type: TileResourceType.METAL,
				});
			}
		}
		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.resourceicons": data,
			}),
		});
	}

	static createHtmlElement(): HTMLElement {
		const html = `	
			<div
				class='resource-icon'
				style='left:0;top:0;background-image:#ff00ff'
			>
			</div>
		`;
		const element = document.createElement("div");
		element.innerHTML = html;
		return element.children[0] as HTMLElement;
	}


	static render(context: GameHtmlRenderContext, data: ResourceIconsHtmlData, baseElement: HTMLElement, lowQuality: boolean) {
		const pos = Projections.hexToScreen(context.camera, data.tile.position.q, data.tile.position.r);
		pos.y = context.camera.getClientHeight() - pos.y;
		baseElement.style.left = pos.x.toString() + "px";
		baseElement.style.top = pos.y.toString() + "px";
		baseElement.style.backgroundImage = "url('" + data.type.getIconPath() + "')";
		baseElement.className = lowQuality ? "resource-icon low-quality" : "resource-icon";
	}

}

export interface ResourceIconsHtmlData extends HtmlDataEntry {
	tile: TileSummary,
	type: TileResourceType,
}