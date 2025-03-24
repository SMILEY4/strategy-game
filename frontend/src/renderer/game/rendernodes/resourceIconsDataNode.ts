import {GameHtmlRenderContext} from "../gameRenderContext";
import {HtmlDataEntry, HtmlDataNode, HtmlDataResource} from "../../common/graph/nodes/htmlDataNode";
import {TileSummary} from "../../../models/tile/tileSummary";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodes/nodeOutput";
import {TileResourceType} from "../../../models/tile/TileResourceType";
import {MapMode} from "../../../models/misc/mapMode";

export class ResourceIconsDataNode extends HtmlDataNode<GameHtmlRenderContext> {

	public static readonly ID = "htmldatanode.resourceIcons";

	constructor() {
		super({
			id: ResourceIconsDataNode.ID,
			changeKey: ResourceIconsDataNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlData({
					name: "htmldata.resourceicons",
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
					type: TileResourceType.METAL
				});
			}
		}

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.resourceicons": data,
			}),
		});
	}

}

export interface ResourceIconsHtmlData extends HtmlDataEntry {
	tile: TileSummary,
	type: TileResourceType,
}